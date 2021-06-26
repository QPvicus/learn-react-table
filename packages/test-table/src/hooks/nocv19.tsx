/*
 * @Author: Taylor Swift
 * @Date: 2021-06-26 18:21:48
 * @LastEditTime: 2021-06-26 20:12:01
 * @Description:
 */

import { useEffect, useState } from 'react'
import { getNCov2019Data } from './cdn-data'
import _ from 'lodash'

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
