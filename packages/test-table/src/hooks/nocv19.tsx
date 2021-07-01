/*
 * @Author: Taylor Swift
 * @Date: 2021-06-26 18:21:48
 * @LastEditTime: 2021-07-01 17:53:50
 * @Description:
 */

import { useEffect, useState } from 'react'
import { getNCov2019Data } from './cdn-data'
import _ from 'lodash'
import { amount, time } from './format'

interface ProvinceItem {
  provinceName: string
  confirmedCount: number
  suspectedCount: number
  curedCount: number
  deadCount: number
  updateTime: string
  children?: CityItem[]
}

type CityItem = Omit<ProvinceItem, 'children'> & {
  cityName: string
}

export function useProvinceDataSource() {
  const [{ dataSource, isLoading }, setState] = useState({
    dataSource: [],
    isLoading: true,
  })

  useEffect(() => {
    getNCov2019Data().then((data) => {
      const provinceItems = _.uniqBy(data, (d) => d.provinceName + '--' + d.updateTime).map<ProvinceItem>((d) => ({
        provinceName: d.provinceName,
        confirmedCount: Number(d.province_confirmedCount),
        suspectedCount: Number(d.province_suspectedCount),
        curedCount: Number(d.province_curedCount),
        deadCount: Number(d.province_deadCount),
        updateTime: d.updateTime,
      }))
      setState({
        dataSource: _.orderBy(
          Object.values(_.groupBy(provinceItems, (d) => d.provinceName)).map((data) => {
            return _.maxBy(data, (d) => d.updateTime)
          }),
          (d) => -d.confirmedCount,
        ),
        isLoading: false,
      })
    })
  }, [])
  return { dataSource, isLoading }
}

const rawCols = {
  provinceName: { code: 'provinceName', name: '省份', width: 150 },
  cityName: { code: 'cityName', name: '城市', width: 150 },
  confirmedCount: { code: 'confirmedCount', name: '确诊', width: 100, render: amount, align: 'right' },
  suspectedCount: { code: 'suspectedCount', name: '疑似', width: 100, render: amount, align: 'right' },
  curedCount: { code: 'curedCount', name: '治愈', width: 100, render: amount, align: 'right' },
  deadCount: { code: 'deadCount', name: '死亡', width: 100, render: amount, align: 'right' },
  updateTime: { code: 'updateTime', name: '最后更新时间', width: 180, render: time },
} as const

const lockProvCol = { lock: true, ...rawCols.provinceName }
const lockCityCol = { lock: true, ...rawCols.cityName }
const lockTimeCol = { lock: true, ...rawCols.updateTime }
const indCols = [rawCols.confirmedCount, rawCols.curedCount, rawCols.deadCount]

export const cols = { ...rawCols, indCols, lockProvCol, lockCityCol, lockTimeCol }

export const testProvColumns = [cols.provinceName, ...cols.indCols, cols.updateTime]
