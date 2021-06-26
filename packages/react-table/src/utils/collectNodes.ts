/*
 * @Author: Taylor Swift
 * @Date: 2021-06-19 16:40:16
 * @LastEditTime: 2021-06-19 16:46:00
 * @Description:
 */

import { AbstractTreeNode } from '../interfaces'
import isLeafNode from './isLeafNode'

/**
 *
 * @param node
 * @param order
 *
 * @description
 *  pre 前序遍历 (默认)
 *  post  后序遍历
 *  leaf-only 只收集叶子节点 忽略内部节点
 */
export default function collectNodes<T extends AbstractTreeNode>(
	node: T[],
	order: 'pre' | 'post' | 'leaf-only' = 'pre'
) {
	const result: T[] = []
	dfs(node)
	function dfs(nodes: T[]) {
		if (nodes == null) return
		for (const node of nodes) {
			if (isLeafNode(node)) {
				result.push(node)
			} else {
				if (order === 'pre') {
					result.push(node)
					dfs(node.children as T[])
				} else if (order === 'post') {
					dfs(node.children as T[])
					result.push(node)
				} else {
					dfs(node.children as T[])
				}
			}
		}
	}
	return result
}
