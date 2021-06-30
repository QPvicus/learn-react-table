/*
 * @Author: Taylor Swift
 * @Date: 2021-06-16 11:32:01
 * @LastEditTime: 2021-06-30 20:54:44
 * @Description:
 */

import React from 'react'
import cx from 'classnames'
import { ArtColumn } from '../interfaces'
import getTreeDepth from '../utils/getTreeDepth'
import isLeafNode from '../utils/isLeafNode'
import { HorizontalRenderRange, RenderInfo } from './interfaces'
import { Classes } from './style'
import { CSSProperties } from 'styled-components'

function range(n: number) {
  const array: number[] = []
  for (let i = 0; i < n; i++) {
    array.push(i)
  }
  return array
}

type IndexedCol = {
  colIndex: number
  col: ArtColumn
  children?: IndexedCol[]
}

type ColWidthRenderInfo =
  | {
      type: 'normal'
      colIndex: number
      col: ArtColumn
      colSpan: number
      isLeaf: boolean
      width: number
    }
  | {
      type: 'blank'
      blankSide: 'left' | 'right'
      width: number
    }
/** 根据当前横向虚拟滚动 对 nested.center 进行过滤，结果只保留当前视野内可见的那些列配置 */
function filterNestedCenter(centerNested: ArtColumn[], hoz: HorizontalRenderRange, leftFlatCount: number) {
  return dfs(centerNested, leftFlatCount).filtered
  function dfs(cols: ArtColumn[], startColIndex: number) {
    let leafCount = 0
    const filtered: IndexedCol[] = []
    for (const col of cols) {
      const colIndex = startColIndex + leafCount
      if (isLeafNode(col)) {
        leafCount += 1
        if (leftFlatCount + hoz.leftIndex <= colIndex && colIndex < leftFlatCount + hoz.rightIndex) {
          filtered.push({ colIndex, col })
        }
      } else {
        const dfsRes = dfs(col.children, colIndex)
        if (dfsRes.filtered.length > 0) {
          filtered.push({ colIndex, col, children: dfsRes.filtered })
        }
      }
    }

    return { filtered, leafCount }
  }
}

/** 包装列配置 附加上 colIndex属性 */
function attachColIndex(inputNested: ArtColumn[], colIndexOffset: number) {
  function dfs(input: ArtColumn[], startColIndex: number) {
    const result: IndexedCol[] = []
    let leafCount = 0
    for (let i = 0; i < input.length; i++) {
      const col = input[i]
      const colIndex = startColIndex + leafCount
      if (isLeafNode(col)) {
        leafCount += 1
        result.push({ col, colIndex })
      } else {
        const sub = dfs(col.children, colIndex)
        leafCount += sub.leafCount
        if (sub.leafCount > 0) {
          result.push({ col, colIndex, children: sub.result })
        }
      }
    }
    return { result, leafCount }
  }
  return dfs(inputNested, colIndexOffset).result
}

/** 根据nested 列配置 算出相应的leveled & flat 配置方便渲染 */
function calculateLeveledAndFlat(nested: IndexedCol[], rowCount: number) {
  console.log(nested, rowCount)
  const leveled: ColWidthRenderInfo[][] = []
  for (let depth = 0; depth < rowCount; depth++) {
    leveled.push([])
  }

  const flat: ColWidthRenderInfo[] = []
  dfs(nested, 0)
  return { leveled, flat }

  function dfs(input: IndexedCol[], depth: number) {
    let leafCount = 0
    for (let i = 0; i < input.length; i++) {
      const indexedCol = input[i]

      if (isLeafNode(indexedCol)) {
        leafCount += 1
        const wrapped = {
          type: 'normal' as const,
          width: indexedCol.col.width,
          col: indexedCol.col,
          colIndex: indexedCol.colIndex,
          colSpan: 1,
          isLeaf: true,
        }
        leveled[depth].push(wrapped)
        flat.push(wrapped)
      } else {
        const dfsRes = dfs(indexedCol.children, depth + 1)
        leafCount += dfsRes.leafCount
        if (dfsRes.leafCount > 0) {
          leveled[depth].push({
            type: 'normal',
            width: indexedCol.col.width,
            col: indexedCol.col,
            colIndex: indexedCol.colIndex,
            colSpan: dfsRes.leafCount,
            isLeaf: false,
          })
        }
      }
    }

    return { leafCount }
  }
}

/** 计算用于渲染表头的数据结构 */
function calculateHeaderRenderInfo(
  { horizontalRenderRange: hoz, flat, nested, useVirtual }: RenderInfo,
  rowCount: number,
): {
  flat: ColWidthRenderInfo[]
  leveled: ColWidthRenderInfo[][]
} {
  console.log('nested header', nested)
  console.log(hoz)
  if (useVirtual.header) {
    // 开启 虚拟滚动
    console.log(nested)
    console.log(attachColIndex(nested.left, 0), 'header attachIndex')
    const leftPart = calculateLeveledAndFlat(attachColIndex(nested.left, 0), rowCount)
    const filtered = filterNestedCenter(nested.center, hoz, flat.left.length)
    const centerPart = calculateLeveledAndFlat(filtered, rowCount)
    const rightPart = calculateLeveledAndFlat(
      attachColIndex(flat.right, flat.left.length + flat.center.length),
      rowCount,
    )

    return {
      flat: [
        ...leftPart.flat,
        { type: 'blank', width: hoz.leftBlank, blankSide: 'left' },
        ...centerPart.flat,
        { type: 'blank', width: hoz.rightBlank, blankSide: 'right' },
        ...rightPart.flat,
      ],
      leveled: range(rowCount).map((depth) => [
        ...leftPart.leveled[depth],
        { type: 'blank', width: hoz.leftBlank, blankSide: 'left' },
        ...centerPart.leveled[depth],
        { type: 'blank', width: hoz.rightBlank, blankSide: 'right' },
        ...rightPart.leveled[depth],
      ]),
    }
  }
  console.log(calculateLeveledAndFlat(attachColIndex(nested.full, 0), rowCount))
  return calculateLeveledAndFlat(attachColIndex(nested.full, 0), rowCount)
}

export default function TableHeader({ info }: { info: RenderInfo }) {
  const { nested, flat, stickyLeftMap, stickyRightMap } = info
  const rowCount = getTreeDepth(nested.full) + 1
  const headerRenderInfo = calculateHeaderRenderInfo(info, rowCount)
  const fullFlatCount = flat.full.length
  const leftFlatCount = flat.left.length
  const rightFlatCount = flat.right.length
  console.log(fullFlatCount, leftFlatCount, rightFlatCount, 'count')
  const thead = headerRenderInfo.leveled.map((wrappedCols, level) => {
    const headerCells = wrappedCols.map((wrapped) => {
      if (wrapped.type === 'normal') {
        const { isLeaf, colSpan, colIndex, col } = wrapped
        const headerCellProps = col.headerCellProps ?? {}
        const positionStyle: CSSProperties = {}
        if (colIndex < leftFlatCount) {
          positionStyle.position = 'sticky'
          positionStyle.left = stickyLeftMap.get(colIndex)
        } else if (colIndex >= fullFlatCount - rightFlatCount) {
          positionStyle.position = 'sticky'
          //  没动此处
          positionStyle.right = stickyRightMap.get(colIndex + colSpan - 1)
        }
        return (
          <th
            key={colIndex}
            {...headerCellProps}
            className={cx(Classes.tableHeaderCell, headerCellProps.className, {
              first: colIndex === 0,
              last: colIndex + colSpan === fullFlatCount,
              'lock-left': colIndex < leftFlatCount,
              'lock-right': colIndex >= fullFlatCount - rightFlatCount,
            })}
            colSpan={colSpan}
            rowSpan={isLeaf ? rowCount - level : undefined}
            style={{
              textAlign: col.align,
              ...headerCellProps.style,
              ...positionStyle,
            }}
          >
            {col.title ?? col.name}
          </th>
        )
      } else {
        // type === 'blank'
        if (wrapped.width > 0) {
          return <th key={wrapped.blankSide} />
        } else {
          return null
        }
      }
    })
    return (
      <tr
        key={level}
        className={cx(Classes.tableHeaderRow, {
          first: level === 0,
          last: level === rowCount - 1,
        })}
      >
        {headerCells}
      </tr>
    )
  })
  return (
    <table>
      <colgroup>
        {headerRenderInfo.flat.map((wrapped) => {
          if (wrapped.type === 'blank') {
            if (wrapped.width > 0) {
              return <col key={wrapped.blankSide} style={{ width: wrapped.width }} />
            } else {
              return null
            }
          } else {
            return <col key={wrapped.colIndex} style={{ width: wrapped.width }} />
          }
        })}
      </colgroup>
      <thead>{thead}</thead>
    </table>
  )
}
