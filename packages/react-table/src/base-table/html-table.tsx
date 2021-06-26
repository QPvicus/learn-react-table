/*
 * @Author: Taylor Swift
 * @Date: 2021-06-19 14:41:11
 * @LastEditTime: 2021-06-26 14:37:32
 * @Description:
 */

import React from 'react'
import cx from 'classnames'
import { Colgroup } from './colgroup'
import { BaseTableProps } from './table'
import { Classes } from './style'
import { internals } from '../internals'
import { RenderInfo } from './interfaces'
import SpanManager from './helper/SpanManager'

export interface HtmlTableProps
	extends Required<Pick<BaseTableProps, 'getRowProps' | 'primaryKey'>> {
	tbodyHtmlTag: 'tbody' | 'tfoot'
	data: any[]
	horizontalRenderInfo: Pick<
		RenderInfo,
		| 'flat'
		| 'visible'
		| 'horizontalRenderRange'
		| 'stickyLeftMap'
		| 'stickyRightMap'
	>
	verticalRenderInfo: {
		offset: number
		first: number
		last: number
		limit: number
	}
}

export function HtmlTable({
	tbodyHtmlTag,
	data,
	primaryKey,
	getRowProps,
	verticalRenderInfo: verInfo,
	horizontalRenderInfo: hozInfo
}: HtmlTableProps) {
	console.log(verInfo, hozInfo, 'verInfo')
	const { flat, horizontalRenderRange: hoz } = hozInfo
	console.log(flat, hoz, 'table html')
	const spanManager = new SpanManager()
	const fullFlatCount = flat.full.length
	const leftFlatCount = flat.left.length
	const rightFlatCount = flat.right.length

	return (
		<table>
			<Colgroup descriptors={hozInfo.visible} />
			{React.createElement(tbodyHtmlTag, null, data.map(renderRow))}
		</table>
	)

	function renderRow(record: any, i: number) {
		console.log(record, 'record')
		const rowIndex = verInfo.offset + i
		const rowProps = getRowProps(record, rowIndex)
		const rowClass = cx(
			Classes.tableRow,
			{
				first: rowIndex === verInfo.first,
				last: rowIndex === verInfo.last,
				even: rowIndex % 2 === 0,
				odd: rowIndex % 2 === 1
			},
			rowProps?.className
		)

		return (
			<tr
				{...rowProps}
				className={rowClass}
				key={internals.safeGetRowKey(primaryKey, record, rowIndex)}
				data-rowindex={rowIndex}
			>
				{/* {hozInfo.visible.map()} */}
			</tr>
		)
	}
}
