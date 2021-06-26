/*
 * @Author: Taylor Swift
 * @Date: 2021-06-18 19:53:26
 * @LastEditTime: 2021-06-19 14:07:54
 * @Description:
 */

import React from 'react'
import cx from 'classnames'
import { Colgroup } from './colgroup'
import { VisibleColumnDescriptor } from './interfaces'
import { Classes } from './style'

const DefaultEmptyContent = React.memo(() => (
	<>
		<img
			alt="empty-image"
			className="empty-image"
			src="//img.alicdn.com/tfs/TB1l1LcM3HqK1RjSZJnXXbNLpXa-50-50.svg"
		/>
		<div>
			没有符合查询条件得数据
			<br />
			请修改条件后重新查询
		</div>
	</>
))

export interface EmptyTableProps {
	descriptors: VisibleColumnDescriptor[]
	isLoading: boolean
	emptyHeight?: number
	EmptyContent?: React.ComponentType
}

export function EmptyHtmlTable({
	descriptors,
	isLoading,
	emptyHeight,
	EmptyContent = DefaultEmptyContent
}: EmptyTableProps) {
	const show = !isLoading

	return (
		<table>
			<Colgroup descriptors={descriptors} />
			<tbody>
				<tr
					className={cx(Classes.tableRow, 'first', 'last', 'no-hover')}
					data-rowindex={0}
				>
					<td
						className={cx(Classes.tableCell, 'first', 'last')}
						colSpan={descriptors.length}
						style={{ height: emptyHeight ?? 200 }}
					>
						{show && (
							<div className={Classes.emptyWrapper}>
								<EmptyContent />
							</div>
						)}
					</td>
				</tr>
			</tbody>
		</table>
	)
}
