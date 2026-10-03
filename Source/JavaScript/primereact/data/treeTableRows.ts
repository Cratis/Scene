// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TreeNode } from '../TreeNode';
import { TreeTableRow } from './TreeTableRow';

/**
 * Flattens the nodes into the rows that are visible: a node's children follow it only while it is expanded.
 *
 * @param nodes The sibling nodes to flatten.
 * @param expanded The keys of the expanded nodes.
 */
export function visibleRows(nodes: TreeNode[], expanded: ReadonlySet<string>, depth = 0, parentKey?: string): TreeTableRow[] {
    return nodes.flatMap((node, index) => {
        const key = node.key ?? '';
        const row: TreeTableRow = { node, key, depth, parentKey, position: index + 1, siblings: nodes.length };
        return [row, ...(node.children !== undefined && expanded.has(key) ? visibleRows(node.children, expanded, depth + 1, key) : [])];
    });
}

/** The keys of the nodes authored as expanded, at any depth, in tree order. */
export function expandedKeysOf(nodes: TreeNode[]): string[] {
    return nodes.flatMap(node => [
        ...(node.expanded === true && node.key !== undefined ? [node.key] : []),
        ...expandedKeysOf(node.children ?? []),
    ]);
}

/** A node's own text for naming it: its label, else its key. */
export function nodeLabel(node: TreeNode): string {
    return node.label ?? node.key ?? '';
}
