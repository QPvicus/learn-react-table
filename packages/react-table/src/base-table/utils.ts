/*
 * @Author: Taylor Swift
 * @Date: 2021-06-16 08:48:42
 * @LastEditTime: 2021-06-19 20:08:24
 * @Description:
 */

export const STYLED_REF_PROP = 'ref'

export const AUTO_VIRTUAL_THRESHOLD = 100

export const OVERSCAN_SIZE = 100

export function sum(arr: number[]) {
	let result = 0
	arr.forEach((x) => {
		result += x
	})
	return result
}
