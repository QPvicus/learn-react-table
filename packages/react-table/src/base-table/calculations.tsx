/*
 * @Author: Taylor Swift
 * @Date: 2021-06-19 15:50:09
 * @LastEditTime: 2021-06-24 19:51:34
 * @Description:
 */

import { ArtColumn, VirtualEnum } from '../interfaces'
import collectNodes from '../utils/collectNodes'
import isLeafNode from '../utils/isLeafNode'
import {
	HorizontalRenderRange,
	RenderInfo,
	ResolvedUseVirtual,
	VisibleColumnDescriptor
} from './interfaces'
import { BaseTable } from './table'
import { AUTO_VIRTUAL_THRESHOLD, OVERSCAN_SIZE, sum } from './utils'

function resolveVirtualEnabled(
	virtualEnum: VirtualEnum,
	defaultValue: boolean
) {
	if (virtualEnum == null || virtualEnum === 'auto') {
		return defaultValue
	}
	return virtualEnum
}

/** 检查列配置 & 设置默认宽度 & 剔除隐藏的列 */
export function processColumns(
	columns: ArtColumn[],
	defaultColumnWidth: number
) {
	if (columns == null || !Array.isArray(columns)) {
		console.warn('<BaseTable /> props.column 需要传入一个数组', columns)
		columns = []
	}

	function dfs(columns: ArtColumn[]): ArtColumn[] {
		const result: ArtColumn[] = []
		for (let column of columns) {
			if (column.width == null) {
				if (defaultColumnWidth != null) {
					column = { ...column, width: defaultColumnWidth }
				}
			}
			if (isLeafNode(column)) {
				result.push(column)
			} else {
				const nextChildren = dfs(column.children)
				if (nextChildren.length > 0) {
					result.push({ ...column, children: nextChildren })
				}
			}
		}
		return result
	}

	return dfs(columns)
}

function getLeftNestedLockCount(columns: ArtColumn[]) {
	let nestedCount = 0
	for (let column of columns) {
		if (isLock(column)) {
			nestedCount += 1
		} else {
			break
		}
	}
	function isLock(col: ArtColumn): boolean {
		if (isLeafNode(col)) {
			return col.lock
		} else {
			return col.lock || col.children.some(isLock)
		}
	}
	return nestedCount
}

function getHorizontalRenderRange({
	offsetX,
	maxRenderWidth,
	flat,
	useVirtual
}: {
	offsetX: number
	maxRenderWidth: number
	flat: RenderInfo['flat']
	useVirtual: ResolvedUseVirtual
}): HorizontalRenderRange {
	if (!useVirtual.horizontal)
		return {
			leftIndex: 0,
			rightIndex: flat.full.length,
			leftBlank: 0,
			rightBlank: 0
		}
	let leftIndex = 0
	let leftBlank = 0
	let centerCount = 0
	let centerRenderWidth = 0

	const overscannedOffsetX = Math.max(0, offsetX - OVERSCAN_SIZE)
	while (leftIndex < flat.center.length) {
		const col = flat.center[leftIndex]
		if (col.width + leftBlank < overscannedOffsetX) {
			leftBlank += col.width
			leftIndex++
		} else {
			break
		}
	}

	const minCenterRenderWidth =
		maxRenderWidth + (overscannedOffsetX - leftBlank) + 2 * OVERSCAN_SIZE
	while (leftIndex + centerCount < flat.center.length) {
		const col = flat.center[leftIndex + centerCount]
		if (col.width + centerRenderWidth < minCenterRenderWidth) {
			centerRenderWidth += col.width
			centerCount++
		} else {
			break
		}
	}

	const rightBlankCount = flat.center.length - leftIndex - centerCount
	const rightBlank = sum(
		flat.center
			.slice(flat.center.length - rightBlankCount)
			.map((col) => col.width)
	)

	return {
		leftIndex,
		leftBlank,
		rightIndex: leftIndex + centerCount,
		rightBlank
	}
}

export function calculationRenderInfo(table: BaseTable): RenderInfo {
	const { offsetX, maxRenderWidth } = table.state
	const {
		useVirtual: useVirtualProp,
		columns: columnProp,
		dataSource: dataSourceProp,
		defaultColumnWidth
	} = table.props

	const columns = processColumns(columnProp, defaultColumnWidth)
	const leftNestedLockCount = getLeftNestedLockCount(columns)
	const fullFlat = collectNodes(columns, 'leaf-only')

	let flat: RenderInfo['flat']
	let nested: RenderInfo['nested']
	let useVirtual: RenderInfo['useVirtual']

	if (leftNestedLockCount === columns.length) {
		flat = { left: [], right: [], full: fullFlat, center: fullFlat }
		nested = { left: [], right: [], full: columns, center: columns }
		useVirtual = { horizontal: false, vertical: false, header: false }
	} else {
		const leftNested = columns.slice(0, leftNestedLockCount)
		const rightNestedLockCount = getLeftNestedLockCount(
			columns.slice().reverse()
		)
		const centerNested = columns.slice(
			leftNestedLockCount,
			columns.length - rightNestedLockCount
		)
		const rightNested = columns.slice(columns.length - rightNestedLockCount)

		const shouldEnableHoVirtual =
			fullFlat.length >= AUTO_VIRTUAL_THRESHOLD &&
			fullFlat.every((col) => col.width != null)
		const shouldEnableVerVirtual =
			dataSourceProp.length >= AUTO_VIRTUAL_THRESHOLD

		useVirtual = {
			horizontal: resolveVirtualEnabled(
				typeof useVirtualProp === 'object'
					? useVirtualProp.horizontal
					: useVirtualProp,
				shouldEnableHoVirtual
			),
			vertical: resolveVirtualEnabled(
				typeof useVirtualProp === 'object'
					? useVirtualProp.vertical
					: useVirtualProp,
				shouldEnableVerVirtual
			),
			header: resolveVirtualEnabled(
				typeof useVirtualProp === 'object'
					? useVirtualProp.header
					: useVirtualProp,
				false
			)
		}

		flat = {
			left: collectNodes(leftNested, 'leaf-only'),
			right: collectNodes(rightNested, 'leaf-only'),
			center: collectNodes(centerNested, 'leaf-only'),
			full: fullFlat
		}

		nested = {
			left: leftNested,
			right: rightNested,
			center: centerNested,
			full: columns
		}
	}

	const horizontalRenderRange = getHorizontalRenderRange({
		offsetX,
		maxRenderWidth,
		useVirtual,
		flat
	})
	// 竖直 待定
	const verticalRenderRange = table.getVerticalRenderRange(useVirtual)
	const { leftIndex, leftBlank, rightBlank, rightIndex } = horizontalRenderRange
	const unfilteredVisibleColumnDescriptors: VisibleColumnDescriptor[] = [
		...flat.left.map(
			(col, i) => ({ type: 'normal', col, colIndex: i } as const)
		),
		leftBlank > 0 && { type: 'blank', blankSide: 'left', width: leftBlank },
		...flat.center.slice(leftIndex, rightIndex).map(
			(col, i) =>
				({
					type: 'normal',
					col,
					colIndex: leftIndex + flat.left.length + i
				} as const)
		),
		rightBlank > 0 && { type: 'blank', blankSide: 'right', width: rightBlank },
		...flat.right.map(
			(col, i) =>
				({
					type: 'normal',
					col,
					colIndex: flat.full.length - flat.right.length + i
				} as const)
		)
	]

	const visibleColumnDescriptors =
		unfilteredVisibleColumnDescriptors.filter(Boolean)

	const fullFlatCount = flat.full.length
	const leftFlatCount = flat.left.length
	const rightFlatCount = flat.right.length

	const stickyLeftMap = new Map<number, number>()
	let stickyLeft = 0
	for (let i = 0; i < leftFlatCount; i++) {
		stickyLeftMap.set(i, stickyLeft)
		stickyLeft += flat.left[i].width
	}
	const stickyRightMap = new Map<number, number>()
	let stickyRight = 0
	for (let i = 0; i < rightFlatCount; i++) {
		stickyRightMap.set(fullFlatCount - 1 - i, stickyRight)
		stickyLeft += flat.left[fullFlatCount - 1 - i].width
	}

	const leftLockTotalWidth = sum(flat.left.map((col) => col.width))
	const rightLockTotalWidth = sum(flat.right.map((col) => col.width))

	return {
		horizontalRenderRange,
		verticalRenderRange,
		visible: visibleColumnDescriptors,
		flat,
		nested,
		useVirtual,
		stickyLeftMap,
		stickyRightMap,
		leftLockTotalWidth,
		rightLockTotalWidth,
		hasLockColumn: nested.left.length > 0 || nested.right.length > 0
	}
}
