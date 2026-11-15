// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findStructureNode } from './findStructureNode';
import { isOperationPermitted } from './isOperationPermitted';
import { StructureOperation } from './StructureOperation';
import type { StructureTreeAdapter } from './StructureTreeAdapter';

// Whether a node can be removed: it exists, it is not a root of the screen - the screen itself is never removed, only what is in it -
// and it is the author's own, not something a template gives the screen.
export function isRemovable<T>(roots: T[], id: string, adapter: StructureTreeAdapter<T>): boolean {
    const location = findStructureNode(roots, id, adapter);
    return !!location && location.parent !== null && isOperationPermitted(adapter.ownershipOf(location.node), StructureOperation.Delete);
}

// What should be selected once a node is gone: the sibling that takes its place, else the one before it, else the container it was in.
export function selectionAfterRemoval<T>(roots: T[], id: string, adapter: StructureTreeAdapter<T>): string | undefined {
    const location = findStructureNode(roots, id, adapter);
    if (!location) return undefined;

    const neighbor = location.siblings[location.index + 1] ?? location.siblings[location.index - 1];
    if (neighbor) return adapter.idOf(neighbor);
    return location.parent ? adapter.idOf(location.parent) : undefined;
}
