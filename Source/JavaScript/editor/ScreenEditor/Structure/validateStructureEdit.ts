// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findStructureNode, isWithinStructureNode } from './findStructureNode';
import { isOperationPermitted } from './isOperationPermitted';
import type { StructureEdit } from './StructureEdit';
import { StructureEditRejection } from './StructureEditRejection';
import { StructureOperation } from './StructureOperation';
import type { StructureTreeAdapter } from './StructureTreeAdapter';

const clampIndex = (index: number, length: number): number => Math.max(0, Math.min(index, length));

// Checks a move against the tree: the node must exist and be movable, the target must exist, accept children and be
// open to insertion, the move must not put a node inside itself, and it must actually change something.
// Returns the reason for refusing it, or undefined when the edit is allowed.
export function validateStructureEdit<T>(roots: T[], edit: StructureEdit, adapter: StructureTreeAdapter<T>): StructureEditRejection | undefined {
    const source = findStructureNode(roots, edit.nodeId, adapter);
    if (!source) return StructureEditRejection.NodeNotFound;
    if (!isOperationPermitted(adapter.ownershipOf(source.node), StructureOperation.Move)) return StructureEditRejection.NodeLocked;

    let targetChildren = roots;
    if (edit.targetParentId !== null) {
        const target = findStructureNode(roots, edit.targetParentId, adapter);
        if (!target) return StructureEditRejection.TargetNotFound;
        if (isWithinStructureNode(source.node, edit.targetParentId, adapter)) return StructureEditRejection.WouldCreateCycle;
        if (!adapter.acceptsChildren(target.node)) return StructureEditRejection.TargetNotContainer;
        if (!isOperationPermitted(adapter.ownershipOf(target.node), StructureOperation.Insert)) return StructureEditRejection.TargetLocked;
        targetChildren = adapter.childrenOf(target.node);
    }

    const sameParent = (source.parent === null ? null : adapter.idOf(source.parent)) === edit.targetParentId;
    if (sameParent) {
        const remaining = targetChildren.length - 1;
        if (clampIndex(edit.index, remaining) === source.index) return StructureEditRejection.NoChange;
    }

    return undefined;
}
