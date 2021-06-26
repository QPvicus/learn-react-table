/*
 * @Author: Taylor Swift
 * @Date: 2021-06-19 14:59:19
 * @LastEditTime: 2021-06-19 15:02:13
 * @Description:
 */

function safeGetRowKey(
	primary: string | ((record: any) => string),
	record: any,
	rowIndex: number
): string {
	let key
	if (typeof primary === 'string') {
		key = record[primary]
	} else if (typeof primary === 'function') {
		key = primary(record)
	}
	if (key == null) {
		key = String(rowIndex)
	}
	return key
}

export const internals = {
	safeGetRowKey
} as const
