// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TreeNode } from '../TreeNode';

/**
 * A node in the shape PrimeReact 11's tree and organization chart both accept.
 *
 * The one difference from Scene's own {@link TreeNode} is that `key` is required. PrimeReact 11 resolves
 * every node by key - `Tree.Node` and `OrganizationChart.Node` take a `uKey` and look the node up rather
 * than receiving it - so a node without one cannot be rendered at all, where in PrimeReact 10 it merely
 * misbehaved. Scene's `TreeNode` keeps `key` optional because an author need not supply one; this type is
 * where that optionality is discharged.
 *
 * Declared as a type alias rather than an interface on purpose: PrimeReact's node types carry an index
 * signature for arbitrary extra data, and only a type alias is assignable to one.
 */
export type PrimeTreeNode = {
    /**
     * Identity, unique across the whole tree.
     */
    key: string;

    /**
     * The text shown for the node.
     */
    label?: string;

    /**
     * An icon class shown beside the label.
     */
    icon?: string;

    /**
     * Child nodes. A node with no `children` is a leaf.
     */
    children?: PrimeTreeNode[];

    /**
     * Whatever the author attached to the node, carried through untouched.
     */
    data?: unknown;
};

/**
 * Converts Scene's tree model into the node shape PrimeReact 11 renders.
 *
 * Synthesizes a key from the node's path when the author did not supply one, for the same reason
 * `toTreeNodes` does: two siblings sharing a label must not share an identity, or expanding one expands
 * the other. The path is stable across re-renders, so expansion and selection survive them.
 *
 * `expanded` and `selectable` are dropped rather than carried. PrimeReact 11 moved both off the node and
 * onto the component - expansion is `defaultExpandedKeys` / `defaultCollapsedKeys`, selectability is the
 * component's `selectionMode` - so a per-node flag has nowhere to land and would silently do nothing.
 *
 * @param nodes The Scene nodes to convert.
 * @param parentKey The key of the node these belong to, used to build stable child keys.
 * @returns The converted nodes, in order.
 */
export function toPrimeTreeNodes(nodes: TreeNode[], parentKey = ''): PrimeTreeNode[] {
    return nodes.map((node, index) => {
        const { children, expanded, selectable, ...rest } = node;
        const key = node.key ?? (parentKey === '' ? `${index}` : `${parentKey}-${index}`);
        const converted: PrimeTreeNode = { ...rest, key };
        if (children !== undefined) converted.children = toPrimeTreeNodes(children, key);
        return converted;
    });
}
