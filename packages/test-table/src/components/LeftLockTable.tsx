/*
 * @Author: Taylor Swift
 * @Date: 2021-06-26 21:33:37
 * @LastEditTime: 2021-06-26 21:55:12
 * @Description:
 */
import React from 'react'
import { BaseTable } from 'react-table'
import { useProvinceDataSource } from '../hooks/nocv19'
import { amount, time } from '../hooks/format'
export default function leftLockTable() {
  const { dataSource, isLoading } = useProvinceDataSource()
  return (
    <BaseTable
      style={{ width: 500, height: 300, overflow: 'auto' }}
      useOuterBorder
      isLoading={isLoading}
      dataSource={dataSource}
      columns={[
        { lock: true, code: 'provinceName', name: '省份', width: 150 },
        { code: 'confirmedCount', name: '确诊', width: 100, render: amount, align: 'right' },
        { code: 'suspectedCount', name: '疑似', width: 100, render: amount, align: 'right' },
        { code: 'curedCount', name: '治愈', width: 100, render: amount, align: 'right' },
        { code: 'deadCount', name: '死亡', width: 100, render: amount, align: 'right' },
        { code: 'updateTime', name: '最后更新时间', width: 180, render: time },
      ]}
    />
  )
}
