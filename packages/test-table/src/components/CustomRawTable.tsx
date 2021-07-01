/*
 * @Author: Taylor Swift
 * @Date: 2021-07-01 17:50:45
 * @LastEditTime: 2021-07-01 17:57:22
 * @Description:
 */

import React, { useState } from 'react'
import { BaseTable } from 'react-table'
import { testProvColumns, useProvinceDataSource } from '../hooks/nocv19'
export default function CustomRawTable() {
  const { isLoading, dataSource } = useProvinceDataSource()

  const [lastClickRowIndex, setLastClickRowIndex] = useState(2)

  return (
    <div>
      <p>点击表格行以改变该行样式</p>
      <BaseTable
        style={{ '--bgcolor': 'transparent' }}
        isLoading={isLoading}
        dataSource={dataSource.slice(0, 6)}
        columns={testProvColumns}
        getRowProps={(record, rowIndex) => {
          return {
            style:
              rowIndex === lastClickRowIndex
                ? {
                    outlineOffset: -2,
                    outline: '2px solid gold',
                    '--hover-bgcolor': 'transparent',
                    background: 'linear-gradient(140deg, #ff000038, #009cff3d)',
                  }
                : {
                    // 覆盖 website 中自带的 style，实际使用时可以忽略
                    backgroundColor: 'transparent',
                  },
            onClick() {
              setLastClickRowIndex(rowIndex)
            },
          }
        }}
      />
    </div>
  )
}
