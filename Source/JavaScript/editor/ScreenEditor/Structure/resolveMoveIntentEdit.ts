// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findStructureNode } from './findStructureNode';
import { MoveIntent } from './MoveIntent';
import type { StructureEdit } from './StructureEdit';
import type { StructureTreeAdapter } from './StructureTreeAdapter';

// Turns a keyboard move intent into a concrete edit, or undefined when the intent has nowhere to go (the first
// node cannot move up, a top-level node cannot outdent). Whether the edit is allowed is decided separately by
// `applyStructureEdit`, so a keyboard move is held to exactly the rules a drag is.
export function resolveMoveIntentEdit<T>(roots: T[], nodeId: string, intent: MoveIntent, adapter: StructureTreeAdapter<T>): StructureEdit | undefined {
    const source = findStructureNode(roots, nodeId, adapter);
    if (!source) return undefined;
    const parentId = source.parent === null ? null : adapter.idOf(source.parent);

    switch (intent) {
        case MoveIntent.MoveUp:
            return source.index > 0 ? { nodeId, targetParentId: parentId, index: source.index - 1 } : undefined;
        case MoveIntent.MoveDown:
            return source.index < source.siblings.length - 1 ? { nodeId, targetParentId: parentId, index: source.index + 1 } : undefined;
        case MoveIntent.Outdent: {
            if (source.parent === null) return undefined;
            const parentLocation = findStructureNode(roots, adapter.idOf(source.parent), adapter)!;
            const grandparentId = parentLocation.parent === null ? null : adapter.idOf(parentLocation.parent);
            return { nodeId, targetParentId: grandparentId, index: parentLocation.index + 1 };
        }
        case MoveIntent.Indent: {
            const previous = source.index > 0 ? source.siblings[source.index - 1] : undefined;
            if (!previous || !adapter.acceptsChildren(previous)) return undefined;
            return { nodeId, targetParentId: adapter.idOf(previous), index: adapter.childrenOf(previous).length };
        }
    }
}
