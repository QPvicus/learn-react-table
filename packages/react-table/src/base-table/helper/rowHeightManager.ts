/*
 * @Author: Taylor Swift
 * @Date: 2021-06-24 19:49:00
 * @LastEditTime: 2021-06-24 19:49:52
 * @Description:
 */

import { VerticalRenderRange } from '../interfaces'

export function getFullRenderRange(rowCount: number): VerticalRenderRange {
	return {
		topIndex: 0,
		topBlank: 0,
		bottomBlank: 0,
		bottomIndex: rowCount
	}
}
