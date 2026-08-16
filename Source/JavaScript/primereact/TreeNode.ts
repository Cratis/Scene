// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One node in a tree, tree select or organization chart.
 *
 * This type used to be PrimeReact's, imported from `primereact/treenode`. PrimeReact 11 removed that
 * module, so the shape is Scene's now - the same move, and for the same reason, as {@link MenuItem}.
 *
 * `key` is the load-bearing field and the reason this is a named type rather than an inline shape.
 * Expansion and selection are both keyed off it, so a tree of unkeyed nodes expands the wrong rows the
 * moment two siblings share a label. `toTreeNodes` synthesizes one from the node's path when an author
 * did not supply it, which is why the field is optional here but always populated by the time a node
 * reaches a component.
 */
export interface TreeNode {
    /**
     * Identity, unique across the whole tree. Synthesized from the node's path when not authored.
     */
    key?: string;

    /**
     * The text shown for the node.
     */
    label?: string;

    /**
     * An icon class - a `pi pi-*` class from `primeicons`, or any class an application's own icon font
     * defines.
     */
    icon?: string;

    /**
     * Child nodes. A node with no `children` is a leaf.
     */
    children?: TreeNode[];

    /**
     * Whether the node starts out expanded.
     */
    expanded?: boolean;

    /**
     * A class applied to the node's row, so an author can mark a node out visually - a warning state, a
     * muted row - without the tree needing to know what the mark means.
     */
    className?: string;

    /**
     * Whether the node is a leaf regardless of whether it currently has `children`.
     *
     * This exists for lazily loaded trees, where a node's children are fetched only when it is expanded:
     * without it, an unexpanded branch and a leaf are indistinguishable, so every leaf would render an
     * expand affordance that resolves to nothing.
     */
    leaf?: boolean;

    /**
     * Whether the node is shown but cannot be selected.
     */
    selectable?: boolean;

    /**
     * Whatever the author attached to the node - the row behind it, an id, a payload. Opaque to every
     * adapter; carried so a selection handler can get back to what was selected.
     */
    data?: unknown;
}
