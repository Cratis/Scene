// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropZone } from './DropZone';
import { findStructureNode } from './findStructureNode';
import type { StructureEdit } from './StructureEdit';
import type { StructureTreeAdapter } from './StructureTreeAdapter';

// Turns a drop on a tree row into a move. Dropping on the middle of a container puts the node inside it; dropping
// on the top or bottom edge puts it before or after the row, in the row's own parent. Returns undefined when the
// row cannot be found. Whether the move is allowed is decided by `applyStructureEdit`.
export function resolveTreeDrop<T>(roots: T[], movedId: string, targetId: string, zone: DropZone, adapter: StructureTreeAdapter<T>): StructureEdit | undefined {
    const target = findStructureNode(roots, targetId, adapter);
    if (!target) return undefined;

    if (zone === DropZone.Inside) {
        const children = adapter.childrenOf(target.node).filter(child => adapter.idOf(child) !== movedId);
        return { nodeId: movedId, targetParentId: targetId, index: children.length };
    }

    const siblings = target.siblings.filter(sibling => adapter.idOf(sibling) !== movedId);
    const position = siblings.findIndex(sibling => adapter.idOf(sibling) === targetId);
    return {
        nodeId: movedId,
        targetParentId: target.parent === null ? null : adapter.idOf(target.parent),
        index: zone === DropZone.Before ? position : position + 1,
    };
}
