/*
 * @Author: Taylor Swift
 * @Date: 2021-06-26 21:40:46
 * @LastEditTime: 2021-06-26 21:52:49
 * @Description:
 */
import moment from 'moment'
import numeral from 'numeral'

export type NumberFormatter = (value: string | number) => string
export const amount0: NumberFormatter = (v) => {
  if (v === 'v' || v == null) {
    return '-'
  }
  return numeral(v).format('0.0')
}

export const amount = amount0

export const time = (d: string) => {
  return moment(d, 'YYYY-MM-DD HH:mm:ss.sss').format('YYYY年MM月DD日 HH:mm:ss')
}
