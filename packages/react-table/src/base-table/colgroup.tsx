/*
 * @Author: Taylor Swift
 * @Date: 2021-06-19 13:38:00
 * @LastEditTime: 2021-06-19 13:41:02
 * @Description:
 */
import React from 'react'
import { VisibleColumnDescriptor } from './interfaces'

export function Colgroup({
	descriptors
}: {
	descriptors: VisibleColumnDescriptor[]
}) {
	return (
		<colgroup>
			{descriptors.map((descriptor) => {
				if (descriptor.type === 'blank') {
					return (
						<col
							key={descriptor.blankSide}
							style={{ width: descriptor.width }}
						/>
					)
				}
				return (
					<col
						key={descriptor.colIndex}
						style={{ width: descriptor.col.width }}
					/>
				)
			})}
		</colgroup>
	)
}
