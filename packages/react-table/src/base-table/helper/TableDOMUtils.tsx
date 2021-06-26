/*
 * @Author: Taylor Swift
 * @Date: 2021-06-16 10:37:38
 * @LastEditTime: 2021-06-16 10:40:45
 * @Description:
 */

import { Classes } from '../style'

/**
 * @description 表格DOM 结构辅助工具
 */
export class TableDOMHelper {
	readonly artTableWrapper: HTMLDivElement
	constructor(artTableWrapper: HTMLDivElement) {
		this.artTableWrapper = artTableWrapper
	}

	getLoadingIndicator(): HTMLDivElement {
		return this.artTableWrapper.querySelector<HTMLDivElement>(
			`.${Classes.loadingIndicator}`
		)
	}
}
