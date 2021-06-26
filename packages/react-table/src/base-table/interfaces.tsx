/*
 * @Author: Taylor Swift
 * @Date: 2021-06-18 19:58:11
 * @LastEditTime: 2021-06-19 19:31:42
 * @Description:
 */

import { ArtColumn } from '../interfaces'

/*  VisibleColumnDescriptor 用于在表格内部描述「那些在页面中可见的列」 */
export type VisibleColumnDescriptor =
	| { type: 'blank'; blankSide: 'left' | 'right'; width: number }
	| { type: 'normal'; colIndex: number; col: ArtColumn }

export interface VerticalRenderRange {
	topIndex: number
	topBlank: number
	bottomIndex: number
	bottomBlank: number
}

export interface HorizontalRenderRange {
	leftIndex: number
	leftBlank: number
	rightIndex: number
	rightBlank: number
}

export interface ResolvedUseVirtual {
	horizontal: boolean
	vertical: boolean
	header: boolean
}

export interface RenderInfo {
	verticalRenderRange: VerticalRenderRange
	horizontalRenderRange: HorizontalRenderRange
	visible: VisibleColumnDescriptor[]

	flat: {
		full: ArtColumn[]
		left: ArtColumn[]
		center: ArtColumn[]
		right: ArtColumn[]
	}
	nested: {
		full: ArtColumn[]
		left: ArtColumn[]
		center: ArtColumn[]
		right: ArtColumn[]
	}
	stickyLeftMap: Map<number, number>
	stickyRightMap: Map<number, number>
	useVirtual: ResolvedUseVirtual

	/* props.column 是否包含有校的锁列 */
	hasLockColumn: boolean
	leftLockTotalWidth: number
	rightLockTotalWidth: number
}
