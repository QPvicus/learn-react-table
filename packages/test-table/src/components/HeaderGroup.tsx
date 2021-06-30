/*
 * @Author: Taylor Swift
 * @Date: 2021-06-26 21:53:49
 * @LastEditTime: 2021-06-26 21:54:55
 * @Description:
 */

import React from 'react'
import { useProvinceDataSource } from '../hooks/nocv19'
import { BaseTable } from 'react-table'
export default function HeaderGroup() {
  const { dataSource } = useProvinceDataSource()
  return (
    <div
      style={{
        height: 500,
        width: 500,
        overflow: 'auto',
        margin: '0 auto',
      }}
    >
      <BaseTable
        columns={[
          {
            name: '基本信息',
            lock: true,
            children: [
              { code: 'provinceName', name: '省份', width: 150 },
              {
                code: 'updateTime',
                name: '最后更新时间',
                width: 180,
                render: null,
              },
            ],
          },
          {
            name: '指标分组',
            children: [
              {
                name: '指标分组1',
                children: [
                  {
                    code: 'confirmedCount',
                    name: '确诊',
                    width: 100,
                    render: null,
                    align: 'right',
                  },
                  {
                    code: 'suspectedCount',
                    name: '疑似',
                    width: 100,
                    render: null,
                    align: 'right',
                  },
                ],
              },
              {
                name: '指标分组2',
                children: [
                  {
                    code: 'curedCount',
                    name: '治愈',
                    width: 100,
                    render: null,
                    align: 'right',
                  },
                  {
                    code: 'deadCount',
                    name: '死亡',
                    width: 100,
                    render: null,
                    align: 'right',
                  },
                ],
              },
            ],
          },
        ]}
        dataSource={dataSource}
        isLoading={false}
        useOuterBorder={true}
      />
    </div>
  )
}
