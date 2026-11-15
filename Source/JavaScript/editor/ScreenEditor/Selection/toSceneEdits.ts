// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind, type InsertNodeEdit, type MoveNodeEdit, type RemoveNodeEdit, type SceneElement } from '@cratis/scene.model';
import { elementNodeId } from '@cratis/scene.engine';
import type { StructureEdit } from '../Structure/StructureEdit';
import { slotIndexOf, slotTargetOf } from '../Templates/slotSections';

// A move in the structure tools, as the Scene edit that performs it. A move to the top level has no Scene target and is not expressible.
// `authoredTemplate` is the template being authored, whose slots a drop into one of its sections goes into.
export function toMoveNodeEdit(edit: StructureEdit, authoredTemplate?: string): MoveNodeEdit | undefined {
    if (edit.targetParentId === null) return undefined;
    return { kind: SceneEditKind.MoveNode, nodeId: elementNodeId(edit.nodeId), target: slotTargetOf(edit.targetParentId, authoredTemplate) ?? elementNodeId(edit.targetParentId), index: slotIndexOf(edit.targetParentId, edit.index) };
}

// Insert a new element into a panel at a position - what dropping from the toolbox or activating a drawer item does.
export function toInsertNodeEdit(parentId: string, index: number, element: SceneElement, authoredTemplate?: string): InsertNodeEdit {
    return { kind: SceneEditKind.InsertNode, target: slotTargetOf(parentId, authoredTemplate) ?? elementNodeId(parentId), index: slotIndexOf(parentId, index), element };
}

export function toRemoveNodeEdit(elementId: string): RemoveNodeEdit {
    return { kind: SceneEditKind.RemoveNode, nodeId: elementNodeId(elementId) };
}
