/*
 * @Author: Taylor Swift
 * @Date: 2021-06-24 20:43:33
 * @LastEditTime: 2021-06-24 20:59:16
 * @Description:
 */

import { SpanRect } from '../../interfaces'

export default class SpanManager {
	private rects: SpanRect[] = []
	public testSkip(rowIndex: number, colIndex: number) {
		return this.rects.some(({ top, bottom, left, right }) => {
			return (
				left <= colIndex &&
				colIndex < right &&
				top <= rowIndex &&
				rowIndex < bottom
			)
		})
	}

	public stripUpwards(rowIndex: number) {
		this.rects = this.rects.filter((rect) => rect.bottom > rowIndex)
	}
	public add(
		rowIndex: number,
		colIndex: number,
		colSpan: number,
		rowSpan: number
	) {
		this.rects.push({
			left: colIndex,
			right: colIndex + colSpan,
			top: rowIndex,
			bottom: rowIndex + rowSpan
		})
	}
}
