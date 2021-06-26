/*
 * @Author: Taylor Swift
 * @Date: 2021-06-19 16:07:25
 * @LastEditTime: 2021-06-20 19:28:31
 * @Description:
 */

import { AbstractTreeNode } from '../interfaces'

export default function isLeafNode(node: AbstractTreeNode) {
	return node.children == null || node.children.length === 0
}
