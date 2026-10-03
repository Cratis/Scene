// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TreeNode } from '../TreeNode';

/** One visible row of a tree table, with where it sits in the tree. */
export interface TreeTableRow {
    node: TreeNode;
    key: string;

    /** Zero for a root row. */
    depth: number;

    /** The key of the parent row, `undefined` for a root row. */
    parentKey: string | undefined;

    /** The 1-based position among the siblings, for `aria-posinset`. */
    position: number;

    /** The number of siblings, for `aria-setsize`. */
    siblings: number;
}
