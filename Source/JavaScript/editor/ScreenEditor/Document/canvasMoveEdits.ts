// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isCanvas, elementNodeId } from '@cratis/scene.engine';
import { SceneEditKind, type SceneEdit, type SceneElement } from '@cratis/scene.model';
import { findSceneElement, parentOf } from '../Selection/sceneTree';
import { toInsertNodeEdit } from '../Selection/toSceneEdits';
import type { StructureEdit } from '../Structure/StructureEdit';
import { placementBelow, placeOnCanvas, placementOf, removePlacement, type CanvasPlacement, type PlacedBox } from './placeOnCanvas';

// What a canvas already holds, for finding room: each child's position and, where it has been measured, its height.
export const boxesOn = (canvas: SceneElement | undefined, measure?: BoxMeasure): PlacedBox[] =>
    ((canvas as { children?: SceneElement[] } | undefined)?.children ?? []).map(child => {
        const measured = measure?.((child as { id: string }).id, (canvas as { id: string }).id);
        return { placement: placementOf(child), height: measured?.height, bottom: measured?.bottom };
    });

// How an element was measured, where there is a surface to ask: its height, and its lower edge from the top of the canvas that holds it.
export type BoxMeasure = (elementId: string, canvasId: string) => { height: number; bottom: number } | undefined;

// The edits a move needs when it starts or ends on a canvas, or undefined when it does neither and a plain move is enough. A canvas draws a child
// at its position, so the element is given one where it lands (where it was dropped, else where it was, else below the lowest element there), and loses
// the one it had when it leaves, so nothing of a canvas is saved on an element in flow. The element goes out and comes in as itself in the same
// batch, which the caller applies as the one undo step the move is.
export function canvasMoveEdits(roots: readonly SceneElement[], edit: StructureEdit, at?: CanvasPlacement, measure?: BoxMeasure): SceneEdit[] | undefined {
    const moved = findSceneElement(roots, edit.nodeId);
    if (!moved || edit.targetParentId === null) return undefined;

    const source = parentOf(roots, edit.nodeId);
    const target = findSceneElement(roots, edit.targetParentId);
    const fromCanvas = !!source && isCanvas(source as never);
    const toCanvas = !!target && isCanvas(target as never);
    if (!fromCanvas && !toCanvas) return undefined;

    const sameCanvas = fromCanvas && toCanvas && (source as unknown as { id: string }).id === edit.targetParentId;
    const index = sameCanvas ? (source as unknown as { children: { id: string }[] }).children.findIndex(child => child.id === edit.nodeId) : edit.index;
    const placed = toCanvas
        ? placeOnCanvas(moved, at ?? (sameCanvas ? placementOf(moved) : undefined) ?? placementBelow(boxesOn(target, measure)))
        : removePlacement(moved);

    return [{ kind: SceneEditKind.RemoveNode, nodeId: elementNodeId(edit.nodeId) }, toInsertNodeEdit(edit.targetParentId, index, placed)];
}
