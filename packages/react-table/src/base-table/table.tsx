/*
 * @Author: Taylor Swift
 * @Date: 2021-06-13 21:17:56
 * @LastEditTime: 2021-07-01 17:43:08
 * @Description:
 */

import React from 'react'
import { CSSProperties } from 'react'
import cx from 'classnames'
import { BehaviorSubject, noop, Subscription } from 'rxjs'
import { Classes, LOCK_SHADOW_PADDING, StyledArtTableWrapper } from './style'
import Loading, { LoadingContentWrapperProps } from './loading'
import { TableDOMHelper } from './helper/TableDOMUtils'
import TableHeader from './header'
import { EmptyHtmlTable } from './empty'
import { Colgroup } from './colgroup'
import { HtmlTable } from './html-table'
import { ArtColumn, VirtualEnum } from '../interfaces'
import { calculationRenderInfo } from './calculations'
import { RenderInfo, ResolvedUseVirtual } from './interfaces'
import { getFullRenderRange } from './helper/rowHeightManager'
import { getScrollbarSize, OVERSCAN_SIZE, sum, syncScrollLeft, throttledWindowResize$ } from './utils'
export type PrimaryKey = string | ((record: any) => string)

export interface BaseTableProps {
  /* 主键 */
  primaryKey?: PrimaryKey
  /* 表格展示的数据源 */
  dataSource: any[]
  /* 表格页脚数据源 */
  footerDataSource?: any[]
  /* 表格的列配置 */
  columns: ArtColumn[]
  /* 是否开启虚拟滚动 */
  useVirtual?: VirtualEnum | { horizontal?: VirtualEnum; vertical?: VirtualEnum; header?: VirtualEnum }
  /* 虚拟滚动开启的情况下 表格中每一行的预估高度 */
  estimatedRowHeight?: number
  /* 表格头部是否置顶 */
  isStickyHeader?: boolean
  /* 表格置顶后 距离顶部的距离 */
  stickyTop?: number
  /* 表格底部是否置底 */
  isStickyFooter?: boolean
  /* 表格置底后 距离底部的距离 */
  stickyBottom?: number
  /* 自定义类名 */
  className?: string
  /* 自定义内联样式 */
  style?: CSSProperties
  /* 表格是否有头部 */
  hasHeader?: boolean
  /* 表格是否具有横向的粘性滚动条 */
  hasStickyScroll?: boolean
  /* d横向粘性滚动条高度 */
  stickyScrollHeight?: 'auto' | number
  /* 使用外层div的边框代替单元格的外边框 */
  useOuterBorder?: boolean
  /* 表格是否在加载中 */
  isLoading?: boolean
  /* 数据为空 单元格的高度 */
  emptyCellHeight?: number
  /* 覆盖表格内部用到的组件 */
  components: {
    /* 表格加载时，表格内容的父组件 */
    LoadingContentWrapper?: React.ComponentType<LoadingContentWrapperProps>
    /* 表格加载时的加载组件 */
    LoadingIcon?: React.ComponentType
    /* 数据为空 表格的展示内容 */
    EmptyContent?: React.ComponentType
  }
  /* 列的默认宽度 */
  defaultColumnWidth?: number
  /* 虚拟滚动测试标签 用于 表格内部测试使用 */
  virtualDebugLabel?: string

  getRowProps?(record: any, rowIndex: number): React.HTMLAttributes<HTMLTableRowElement>
}

interface BaseTableState {
  /* 是否要展示自定义滚动条(stickyScroll) */
  hasScroll: boolean
  /** 是否需要渲染 lock sections
   * 当表格较宽时，所有的列都能被完整的渲染，此时不需要渲染 lock sections
   * 只有当「整个表格的宽度」小于「每一列渲染宽度之和」时，lock sections 才需要被渲染 */
  needRenderLock: boolean
  /** 纵向虚拟滚动偏移量 */
  offsetY: number
  /** 纵向虚拟滚动 最大渲染尺寸 */
  maxRenderHeight: number
  /** 横向虚拟滚动偏移量 */
  offsetX: number
  /** 横向虚拟滚动 最大渲染尺寸 */
  maxRenderWidth: number
}

export class BaseTable extends React.Component<BaseTableProps, BaseTableState> {
  static defaultProps = {
    hasHeader: true,
    isStickyHeader: true,
    stickyTop: 0,

    footerDataSource: [] as any[],
    isStickyFooter: true,
    stickyBottom: 0,
    hasStickyScroll: true,
    stickyScrollHeight: 'auto',

    useVirtual: 'auto',
    estimatedRowHeight: 48,

    isLoading: false,
    components: {},
    getRowProps: noop,
    dataSource: [] as any[],
  }
  private artTableWrapperRef = React.createRef<HTMLDivElement>()

  private domHelper: TableDOMHelper
  private props$: BehaviorSubject<BaseTableProps>
  // 最近一次渲染的计算结果缓存
  private lastInfo: RenderInfo
  private rootSubscription = new Subscription()
  constructor(props: Readonly<BaseTableProps>) {
    super(props)

    this.state = {
      hasScroll: true,
      needRenderLock: true,
      offsetX: 0,
      offsetY: 0,
      maxRenderHeight: 600,
      maxRenderWidth: 800,
    }
  }

  /**  自定义滚动条为table宽度 使滚动条滑块宽度相同  */
  private updateStickyScroll() {
    const { stickyScroll, stickyScrollItem, artTable } = this.domHelper
    if (!artTable) {
      return
    }
    const tableBodyHtmlTable = this.domHelper.getTableBodyHtmlTable()
    const innerTableWidth = tableBodyHtmlTable.offsetWidth
    const artTableWidth = artTable.offsetWidth

    const stickyScrollHeightProp = this.props.stickyScrollHeight
    const stickScrollHeight = stickyScrollHeightProp === 'auto' ? getScrollbarSize().height : stickyScrollHeightProp
    stickyScroll.style.marginTop = `${-stickScrollHeight + 1}px`

    if (artTableWidth >= innerTableWidth) {
      if (this.state.hasScroll) {
        this.setState({ hasScroll: false })
      }
    } else {
      //  考虑下mac下面隐藏滚动条的情况
      if (!this.state.hasScroll && stickScrollHeight < 5) {
        this.setState({ hasScroll: true })
      }
    }

    // 设置 子节点宽度
    stickyScrollItem.style.width = `${innerTableWidth}px`
  }

  private updateScrollX(nextOffsetX: number) {
    if (this.lastInfo.useVirtual.horizontal) {
      if (Math.abs(nextOffsetX - this.state.offsetX) >= OVERSCAN_SIZE / 2) {
        this.setState({
          offsetX: nextOffsetX,
        })
      }
    }
  }

  /** 同步横向滚东偏移量  */
  private syncHorizontalScroll(x: number) {
    this.updateScrollX(x)

    const { tableBody } = this.domHelper
    const { flat } = this.lastInfo
    const leftLockShadow = this.domHelper.getLeftLockShadow()
    if (leftLockShadow) {
      const shouldShowLeftShadow = flat.left.length > 0 && this.state.needRenderLock && x > 0
      if (shouldShowLeftShadow) {
        leftLockShadow.classList.add('show-shadow')
      } else {
        leftLockShadow.classList.remove('show-shadow')
      }
    }

    const rightLockShadow = this.domHelper.getRightLockShadow()
    if (rightLockShadow) {
      const shouldShowRightShadow =
        flat.right.length > 0 && this.state.needRenderLock && x < tableBody.scrollWidth - tableBody.clientWidth
      if (shouldShowRightShadow) {
        rightLockShadow.classList.add('show-shadow')
      } else {
        rightLockShadow.classList.remove('show-shadow')
      }
    }
  }

  getVerticalRenderRange(useVertical: ResolvedUseVirtual) {
    const { dataSource } = this.props
    const { offsetY, maxRenderHeight } = this.state
    const rowCount = dataSource.length
    if (useVertical.vertical) {
    } else {
      return getFullRenderRange(rowCount)
    }
  }

  private renderTableHeader(info: RenderInfo) {
    const { hasHeader, stickyTop } = this.props
    return (
      <div
        className={cx(Classes.tableHeader, 'no-scrollbar')}
        style={{
          display: hasHeader ? undefined : 'none',
          top: stickyTop === 0 ? undefined : stickyTop,
        }}
      >
        <TableHeader info={info} />
      </div>
    )
  }
  private renderTableBody(info: RenderInfo) {
    const { dataSource, components, isLoading, emptyCellHeight, footerDataSource, getRowProps, primaryKey } = this.props
    const tableBodyClassName = cx(Classes.tableBody, Classes.horizontalScrollContainer, {
      'no-scroll': footerDataSource.length > 0,
    })
    if (dataSource.length === 0) {
      let EmptyContent = components.EmptyContent
      return (
        <div className={tableBodyClassName}>
          <EmptyHtmlTable
            descriptors={info.visible}
            isLoading={isLoading}
            EmptyContent={EmptyContent}
            emptyHeight={emptyCellHeight}
          />
        </div>
      )
    }
    const { topIndex, topBlank, bottomBlank, bottomIndex } = info.verticalRenderRange
    return (
      <div className={tableBodyClassName}>
        {topBlank > 0 && (
          <div key="top-blank" className={cx(Classes.virtualBlank, 'top')} style={{ height: topBlank }}></div>
        )}
        <HtmlTable
          tbodyHtmlTag="tbody"
          getRowProps={getRowProps}
          primaryKey={primaryKey}
          data={dataSource.slice(topIndex, bottomIndex)}
          horizontalRenderInfo={info}
          verticalRenderInfo={{
            first: 0,
            offset: topIndex,
            limit: bottomIndex,
            last: dataSource.length - 1,
          }}
        />
        {bottomBlank > 0 && <div className={cx(Classes.virtualBlank, 'bottom')} style={{ height: bottomBlank }}></div>}
      </div>
    )
  }
  private renderTableFooter(info: RenderInfo) {
    const { footerDataSource, primaryKey, getRowProps, stickyBottom } = this.props
    return (
      <div className={cx(Classes.tableFooter)} style={{ bottom: stickyBottom === 0 ? undefined : stickyBottom }}>
        <HtmlTable
          tbodyHtmlTag="tfoot"
          data={footerDataSource}
          primaryKey={primaryKey}
          getRowProps={getRowProps}
          horizontalRenderInfo={info}
          verticalRenderInfo={{
            offset: 0,
            first: 0,
            last: footerDataSource.length - 1,
            limit: Infinity,
          }}
        />
      </div>
    )
  }
  private renderLockShadows(info: RenderInfo) {
    return (
      <>
        <div
          className={Classes.lockShadowMask}
          style={{ left: 0, width: info.leftLockTotalWidth + LOCK_SHADOW_PADDING }}
        >
          <div className={cx(Classes.lockShadow, Classes.leftLockShadow)}></div>
        </div>
        <div
          className={Classes.lockShadowMask}
          style={{ right: 0, width: info.rightLockTotalWidth + LOCK_SHADOW_PADDING }}
        >
          <div className={cx(Classes.lockShadow, Classes.rightLockShadow)}></div>
        </div>
      </>
    )
  }

  private renderStickyScroll(info: RenderInfo) {
    const { hasStickyScroll, stickyBottom } = this.props
    const { hasScroll } = this.state
    return (
      <div
        className={cx(Classes.stickyScroll, Classes.horizontalScrollContainer)}
        style={{
          display: hasStickyScroll && hasScroll ? 'block' : 'none',
          bottom: stickyBottom,
        }}
      >
        <div className={Classes.stickyScrollItem}></div>
      </div>
    )
  }

  render() {
    const info = calculationRenderInfo(this)
    console.log(info)
    this.lastInfo = info
    console.log(this, 'this')
    const {
      useOuterBorder,
      dataSource,
      hasHeader,
      isStickyHeader,
      footerDataSource,
      isStickyFooter,
      className,
      style,
      isLoading,
      components,
    } = this.props
    const artTableWrapperClassName = cx(
      Classes.artTableWrapper,
      {
        'use-outer-border': useOuterBorder,
        empty: dataSource.length === 0,
        'has-header': hasHeader,
        'sticky-header': isStickyHeader,
        'has-footer': footerDataSource && footerDataSource?.length > 0,
        'sticky-footer': isStickyFooter,
      },
      className,
    )
    const artTableWrapperProps = {
      className: artTableWrapperClassName,
      style,
      ref: this.artTableWrapperRef,
    }
    return (
      <StyledArtTableWrapper {...artTableWrapperProps}>
        <Loading
          visible={isLoading!}
          LoadingIcon={components.LoadingIcon}
          LoadingContentWrapper={components.LoadingContentWrapper}
        >
          <div className={Classes.artTable}>
            {this.renderTableHeader(info)}
            {this.renderTableBody(info)}
            {this.renderTableFooter(info)}
            {this.renderLockShadows(info)}
          </div>
          {this.renderStickyScroll(info)}
        </Loading>
      </StyledArtTableWrapper>
    )
  }

  componentDidMount() {
    this.updateDOMHelper()
    this.props$ = new BehaviorSubject(this.props)
    this.initSubscriptions()
    this.disMountOrUpdate()
  }

  componentDidUpdate(prevProps: Readonly<BaseTableProps>, prevState: Readonly<BaseTableState>) {
    this.props$.next(this.props)
    this.disMountOrUpdate(prevProps, prevState)
  }

  private disMountOrUpdate(prevProps?: Readonly<BaseTableProps>, prevState?: Readonly<BaseTableState>) {
    this.updateStickyScroll()
    this.adjustNeedRenderLock()
  }

  private initSubscriptions() {
    const { tableHeader, tableBody, tableFooter, stickyScroll } = this.domHelper
    this.rootSubscription.add(
      throttledWindowResize$.subscribe(() => {
        this.updateStickyScroll()
        this.adjustNeedRenderLock()
      }),
    )

    // 滚动同步
    this.rootSubscription.add(
      syncScrollLeft([tableHeader, tableBody, tableFooter, stickyScroll], (scrollLeft) => {
        this.syncHorizontalScroll(scrollLeft)
      }),
    )
  }

  /** 更新 DOM 节点的引用，方便其他方法直接操作 DOM */
  private updateDOMHelper() {
    this.domHelper = new TableDOMHelper(this.artTableWrapperRef.current)
  }

  componentWillUnmount() {
    this.rootSubscription.unsubscribe()
  }

  /** 计算表格所有列的渲染宽度之和，判断表格是否需要渲染锁列 */
  private adjustNeedRenderLock() {
    const { needRenderLock } = this.state
    const { flat, hasLockColumn } = this.lastInfo
    if (hasLockColumn) {
      const sumOfColWidth = sum(flat.full.map((col) => col.width))
      const nextNeedRenderLock = sumOfColWidth > this.domHelper.artTable.clientWidth
      if (needRenderLock !== nextNeedRenderLock) {
        this.setState({
          needRenderLock: nextNeedRenderLock,
        })
      }
    } else {
      if (needRenderLock) {
        this.setState({
          needRenderLock: false,
        })
      }
    }
  }
}
