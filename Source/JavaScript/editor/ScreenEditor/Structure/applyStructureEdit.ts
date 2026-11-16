// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findStructureNode } from './findStructureNode';
import type { StructureEdit } from './StructureEdit';
import type { StructureEditResult } from './StructureEditResult';
import type { StructureTreeAdapter } from './StructureTreeAdapter';
import { validateStructureEdit } from './validateStructureEdit';

function withoutNode<T>(nodes: T[], id: string, adapter: StructureTreeAdapter<T>): T[] {
    return nodes
        .filter(node => adapter.idOf(node) !== id)
        .map(node => {
            const children = adapter.childrenOf(node);
            if (children.length === 0) return node;
            const remaining = withoutNode(children, id, adapter);
            return remaining.length === children.length && remaining.every((child, index) => child === children[index])
                ? node
                : adapter.withChildren(node, remaining);
        });
}

function insertAt<T>(nodes: T[], index: number, node: T): T[] {
    const at = Math.max(0, Math.min(index, nodes.length));
    return [...nodes.slice(0, at), node, ...nodes.slice(at)];
}

function insertUnder<T>(nodes: T[], parentId: string, index: number, moved: T, adapter: StructureTreeAdapter<T>): T[] {
    return nodes.map(node => {
        if (adapter.idOf(node) === parentId) return adapter.withChildren(node, insertAt(adapter.childrenOf(node), index, moved));
        const children = adapter.childrenOf(node);
        if (children.length === 0) return node;
        const updated = insertUnder(children, parentId, index, moved, adapter);
        return updated.every((child, position) => child === children[position]) ? node : adapter.withChildren(node, updated);
    });
}

// Applies a validated move and returns the rebuilt tree, or the reason it was refused. The input tree is never
// mutated - untouched branches are shared with the result.
export function applyStructureEdit<T>(roots: T[], edit: StructureEdit, adapter: StructureTreeAdapter<T>): StructureEditResult<T> {
    const reason = validateStructureEdit(roots, edit, adapter);
    if (reason) return { accepted: false, reason };

    const moved = findStructureNode(roots, edit.nodeId, adapter)!.node;
    const remaining = withoutNode(roots, edit.nodeId, adapter);
    const next = edit.targetParentId === null
        ? insertAt(remaining, edit.index, moved)
        : insertUnder(remaining, edit.targetParentId, edit.index, moved, adapter);

    return { accepted: true, roots: next };
}
