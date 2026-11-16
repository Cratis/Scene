// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StructureRow } from './StructureRow';
import type { StructureTreeAdapter } from './StructureTreeAdapter';

// Flattens the tree into the rows that are currently visible - children appear only under expanded parents.
export function flattenStructure<T>(roots: T[], expandedIds: ReadonlySet<string>, adapter: StructureTreeAdapter<T>, depth = 0, parentId: string | null = null): StructureRow<T>[] {
    return roots.flatMap(node => {
        const id = adapter.idOf(node);
        const children = adapter.childrenOf(node);
        const isExpanded = children.length > 0 && expandedIds.has(id);
        const row: StructureRow<T> = { node, id, depth, parentId, hasChildren: children.length > 0, isExpanded };
        return isExpanded ? [row, ...flattenStructure(children, expandedIds, adapter, depth + 1, id)] : [row];
    });
}
