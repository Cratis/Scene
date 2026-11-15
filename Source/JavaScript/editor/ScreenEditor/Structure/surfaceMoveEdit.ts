// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findStructureNode } from './findStructureNode';
import type { StructureEdit } from './StructureEdit';
import type { StructureTreeAdapter } from './StructureTreeAdapter';

// The move that dropping an element at a marker on the surface asks for. A marker's position counts the children of its container as they
// are now, the element being moved included; a move counts them without it, so a marker below the element's own place in the same
// container is one position nearer the top once it has left.
export function surfaceMoveEdit<T>(roots: T[], adapter: StructureTreeAdapter<T>, movedId: string, containerId: string, markerIndex: number): StructureEdit | undefined {
    const source = findStructureNode(roots, movedId, adapter);
    if (!source) return undefined;

    const sameContainer = source.parent !== null && adapter.idOf(source.parent) === containerId;
    const index = sameContainer && markerIndex > source.index ? markerIndex - 1 : markerIndex;
    return { nodeId: movedId, targetParentId: containerId, index };
}
