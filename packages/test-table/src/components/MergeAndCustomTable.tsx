import React from 'react'
import { ArtColumn, BaseTable } from 'react-table'

export default function MergeAndCustomTable() {
  const dataSource = [
    { prov: '湖北省', confirmed: 54406, cured: 4793, t: '2020-02-15 19:52:02' },
    { prov: '广东省', confirmed: 1294, cured: 409, t: '2020-02-15 19:52:02' },
    { prov: '河南省', confirmed: 1212, cured: 390, t: '2020-02-15 19:52:02' },
    { prov: '浙江省', confirmed: 1162, cured: 428, t: '2020-02-15 19:52:02' },
    { prov: '湖南省', confirmed: 1001, cured: 417, t: '2020-02-15 19:52:02' },
  ]

  const columns = [
    {
      code: 'prov',
      name: '省份',
      getCellProps(value: any, record: any, rowIndex: number) {
        if (rowIndex === 3) {
          return {
            colSpan: 2,
            rowSpan: 2,
            style: { background: '#141414', color: '#ccc', fontWeight: 'bold' },
          }
        }
      },
    },
    { code: 'confirmed', name: '确诊', align: 'right' },
    { code: 'cured', name: '治愈', align: 'right' },
    {
      code: 't',
      name: '最后更新时间',
      getCellProps(value: any, record: any, rowIndex: number) {
        if (rowIndex === 1) {
          return { rowSpan: 3 }
        }
      },
    },
  ] as ArtColumn[]
  return <BaseTable defaultColumnWidth={100} dataSource={dataSource} columns={columns} />
}
