// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StructureLocation } from './StructureLocation';
import type { StructureTreeAdapter } from './StructureTreeAdapter';

// Finds a node anywhere in the tree and reports its parent, index and siblings.
export function findStructureNode<T>(roots: T[], id: string, adapter: StructureTreeAdapter<T>, parent: T | null = null): StructureLocation<T> | undefined {
    for (const [index, node] of roots.entries()) {
        if (adapter.idOf(node) === id) return { node, parent, index, siblings: roots };
        const nested = findStructureNode(adapter.childrenOf(node), id, adapter, node);
        if (nested) return nested;
    }
    return undefined;
}

// Whether `id` is the node itself or anywhere beneath it.
export function isWithinStructureNode<T>(node: T, id: string, adapter: StructureTreeAdapter<T>): boolean {
    if (adapter.idOf(node) === id) return true;
    return adapter.childrenOf(node).some(child => isWithinStructureNode(child, id, adapter));
}
