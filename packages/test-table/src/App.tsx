import React from 'react'
import { BaseTable } from 'react-table'
console.log(1)
const App = () => {
	return (
		<>
			<div
				style={{
					height: 500,
					overflow: 'hidden',
					margin: '0 auto'
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
									render: null
								}
							]
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
											align: 'right'
										},
										{
											code: 'suspectedCount',
											name: '疑似',
											width: 100,
											render: null,
											align: 'right'
										}
									]
								},
								{
									name: '指标分组2',
									children: [
										{
											code: 'curedCount',
											name: '治愈',
											width: 100,
											render: null,
											align: 'right'
										},
										{
											code: 'deadCount',
											name: '死亡',
											width: 100,
											render: null,
											align: 'right'
										}
									]
								}
							]
						}
					]}
					dataSource={[{ a: 1 }]}
					isLoading={false}
					useOuterBorder={true}
				/>
			</div>
		</>
	)
}

export default App
