/*
 * @Author: Taylor Swift
 * @Date: 2021-06-20 15:19:13
 * @LastEditTime: 2021-06-20 15:21:07
 * @Description:
 */

import { AbstractTreeNode } from '../interfaces'
import isLeafNode from './isLeafNode'

export default function getTreeDepth(nodes: AbstractTreeNode[]) {
	let maxDepth = -1
	function dfs(columns: AbstractTreeNode[], depth: number) {
		for (const column of columns) {
			if (isLeafNode(column)) {
				maxDepth = Math.max(maxDepth, depth)
			} else {
				dfs(column.children, depth + 1)
			}
		}
	}
	dfs(nodes, 0)
	return maxDepth
}
