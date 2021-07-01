/*
 * @Author: Taylor Swift
 * @Date: 2021-06-16 10:37:38
 * @LastEditTime: 2021-07-01 17:25:24
 * @Description:
 */

import { Classes } from '../style'

/**
 * @description 表格DOM 结构辅助工具
 */
export class TableDOMHelper {
  readonly artTableWrapper: HTMLDivElement
  readonly artTable: HTMLDivElement
  readonly tableHeader: HTMLDivElement
  readonly tableBody: HTMLDivElement
  readonly tableFooter: HTMLDivElement
  readonly stickyScroll: HTMLDivElement
  readonly stickyScrollItem: HTMLDivElement
  constructor(artTableWrapper: HTMLDivElement) {
    this.artTableWrapper = artTableWrapper
    this.artTable = artTableWrapper.querySelector<HTMLDivElement>(`.${Classes.artTable}`)
    this.tableHeader = this.artTable.querySelector(`:scope > .${Classes.tableHeader}`)
    this.tableBody = this.artTable.querySelector(`:scope > .${Classes.tableBody}`)
    this.tableFooter = this.artTable.querySelector(`:scope > .${Classes.tableFooter}`)

    const stickyScrollSelector = `.${Classes.artTable} + .${Classes.stickyScroll}`
    this.stickyScroll = artTableWrapper.querySelector<HTMLDivElement>(stickyScrollSelector)
    this.stickyScrollItem = this.stickyScroll.querySelector(`.${Classes.stickyScrollItem}`)
  }

  getLoadingIndicator(): HTMLDivElement {
    return this.artTableWrapper.querySelector<HTMLDivElement>(`.${Classes.loadingIndicator}`)
  }

  getTableBodyHtmlTable(): HTMLTableElement {
    return this.artTable.querySelector(`.${Classes.tableBody} > table`)
  }

  getLeftLockShadow(): HTMLDivElement {
    const selector = `:scope > .${Classes.lockShadowMask} .${Classes.leftLockShadow}`
    return this.artTable.querySelector<HTMLDivElement>(selector)
  }
  getRightLockShadow(): HTMLDivElement {
    const selector = `:scope > .${Classes.lockShadowMask} .${Classes.rightLockShadow}`
    return this.artTable.querySelector<HTMLDivElement>(selector)
  }
}
