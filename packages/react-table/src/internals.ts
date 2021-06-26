/*
 * @Author: Taylor Swift
 * @Date: 2021-06-19 14:59:19
 * @LastEditTime: 2021-06-26 20:32:51
 * @Description:
 */

import { ArtColumn } from './interfaces'

function safeGetRowKey(primary: string | ((record: any) => string), record: any, rowIndex: number): string {
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

function safeGetValue(column: ArtColumn, record: any, rowIndex: number) {
  if (column.getValue) {
    return column.getValue(record, rowIndex)
  }
  return record[column.code]
}

export const internals = {
  safeGetRowKey,
  safeGetValue,
} as const
