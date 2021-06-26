/*
 * @Author: Taylor Swift
 * @Date: 2021-06-18 20:00:18
 * @LastEditTime: 2021-06-19 18:29:14
 * @Description:
 */

import React, { ReactNode } from 'react'

export type ArtColumnAlign = 'left' | 'right' | 'center'

export type CellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export type VirtualEnum = false | true | 'auto'

/** SpanRect 用于描述合并单元格的边界
 * 注意 top/left 为 inclusive，而 bottom/right 为 exclusive */
export interface SpanRect {
	top: number
	left: number
	right: number
	bottom: number
}

export interface ArtColumnStaticPart {
	/* 列得名称 */
	name: string
	/* 在数据中显示得字段code */
	code?: string
	/* 列标题的展示名称；在页面中进行展示时，该字段将覆盖 name 字 */
	title?: ReactNode
	/* 列的宽度，如果该列是锁定的，则宽度为必传项 */
	width?: number
	/* 单元格中的文本或内容的 对其方向 */
	align?: ArtColumnAlign
	/* 是否锁列 */
	lock?: boolean
	/* 表头单元格的 props */
	headerCellProps?: CellProps
	/* 功能开关 */
	features?: { [key: string]: any }
}

export interface ArtColumnDynamicPart {
	/* 自定义取数方法 */
	getValue?(row: any, rowIndex: number): any
	/* 自定义渲染方法 */
	render?(value: any, row: any, rowIndex: number): ReactNode
	/* 自定义获取单元格props的方法 */
	getCellProps?(value: any, row: any, rowIndex: any): CellProps
	/* 自定义的获取单元格 SpanRect */
	getSpanRect?(value: any, row: any, rowIndex: number): SpanRect
}

export interface ArtColumn extends ArtColumnStaticPart, ArtColumnDynamicPart {
	/* 该列的子节点 */
	children?: ArtColumn[]
}

export interface AbstractTreeNode {
	children?: AbstractTreeNode[]
}
