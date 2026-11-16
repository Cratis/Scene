// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useRef } from 'react';
import type { SceneEdit, SceneElement } from '@cratis/scene.model';
import { isCanvas } from '@cratis/scene.engine';
import { isRemovable, selectionAfterRemoval } from '../Structure/removal';
import { createExternalComponent } from '../Document/createExternalComponent';
import { createPanel } from '../Document/createPanel';
import { placementBelow, placeOnCanvas, type CanvasPlacement } from '../Document/placeOnCanvas';
import { boxesOn, canvasMoveEdits, type BoxMeasure } from '../Document/canvasMoveEdits';
import type { StructureTreeAdapter } from '../Structure/StructureTreeAdapter';
import { findSceneElement, parentOf } from '../Selection/sceneTree';
import { toInsertNodeEdit, toMoveNodeEdit, toRemoveNodeEdit } from '../Selection/toSceneEdits';
import { StructureEditRejection } from '../Structure/StructureEditRejection';
import { validateStructureEdit } from '../Structure/validateStructureEdit';
import { composeEditorScreen } from '../Templates/composeEditorScreen';
import { isSlotSection } from '../Templates/slotSections';
import type { SessionCell } from '../Session/SessionCell';
import type { ScreenEditorController } from './ScreenEditorController';
import type { ComponentInsertedListener } from './useScreenEditor';
import { nextElementId } from './nextElementId';

const parentIdOf = (roots: readonly SceneElement[], id: string) => (parentOf(roots, id) as { id?: string } | undefined)?.id;

type Applied = { applied: boolean };
type MoveEdit = Parameters<ScreenEditorController['move']>[0];

const childCountOf = (roots: readonly SceneElement[], parent: string | undefined) =>
    parent ? ((findSceneElement(roots, parent) as { children?: unknown[] } | undefined)?.children ?? []).length : 0;

// Dropping on the canvas the element is already on is not "no change": its position is what moves.
const isCanvasReposition = (rejection: ReturnType<typeof validateStructureEdit>, canvasEdits: unknown, edit: MoveEdit, roots: readonly SceneElement[]) =>
    rejection === StructureEditRejection.NoChange && !!canvasEdits && edit.targetParentId === parentIdOf(roots, edit.nodeId);

export interface StructureOperationsInput {
    cell: SessionCell;
    composition: { roots: SceneElement[]; entry?: string };
    authored: { id?: string } | undefined;
    adapter: StructureTreeAdapter<SceneElement>;
    authoringTemplate: string | undefined;
    measureBox: BoxMeasure;
    tryApply: (edit: SceneEdit, label: string) => Applied;
    applyAll: (edits: SceneEdit[], label: string) => Applied;
    setSelectedId: (change: string | undefined | ((current: string | undefined) => string | undefined)) => void;
    onInserted?: ComponentInsertedListener;
}

// Each operation is held to the structure rules and applied as one Scene edit.
export const useStructureOperations = (input: StructureOperationsInput) => {
    const { cell, composition, authored, adapter, authoringTemplate, measureBox, tryApply, applyAll, setSelectedId, onInserted } = input;

    const target = useCallback((parentId: string | undefined, index: number | undefined) => {
        const parent = parentId ?? authored?.id ?? composition.entry;
        return { parent: parent as string, index: index ?? childCountOf(composition.roots, parent) };
    }, [authored, composition]);

    const inserted = useRef(onInserted);
    inserted.current = onInserted;

    const insert = useCallback((element: SceneElement, parentId: string | undefined, index: number | undefined, label: string, at?: CanvasPlacement, key?: string): void => {
        const place = target(parentId, index);
        if (!place.parent) return;
        // On a canvas an element is drawn at its position, so an element added there is given one: where it was dropped, else stepped from the last.
        // The canvas is read from the latest session, not the last render: two elements added before the surface has drawn the first would otherwise each
        // be placed against the same children, and land on one another.
        const parent = findSceneElement(composeEditorScreen(cell.current.document, authoringTemplate).roots, place.parent);
        const onCanvas = !!parent && isCanvas(parent as never);
        const placed = onCanvas ? placeOnCanvas(element, at ?? placementBelow(boxesOn(parent, measureBox))) : element;
        // Selection follows the new element only when it went in; a refused insert leaves the selection where it was.
        if (tryApply(toInsertNodeEdit(place.parent, place.index, placed, authoringTemplate), label).applied) {
            setSelectedId((element as { id: string }).id);
            if (key) inserted.current?.(key);
        }
    }, [tryApply, target, authoringTemplate, measureBox, cell, setSelectedId]);

    const move = useCallback((edit: MoveEdit, at?: CanvasPlacement) => {
        // The sections a template's slots are drawn in are places, not things: they are not moved.
        if (isSlotSection(edit.nodeId)) return StructureEditRejection.NodeLocked;
        const canvasEdits = canvasMoveEdits(composition.roots, edit, at, measureBox);

        const rejection = validateStructureEdit(composition.roots, edit, adapter);
        if (rejection && !isCanvasReposition(rejection, canvasEdits, edit, composition.roots)) return rejection;

        if (canvasEdits) return applyAll(canvasEdits, 'Move').applied ? undefined : StructureEditRejection.NodeLocked;

        const sceneEdit = toMoveNodeEdit(edit, authoringTemplate);
        if (!sceneEdit) return StructureEditRejection.TargetNotContainer;
        return tryApply(sceneEdit, 'Move').applied ? undefined : StructureEditRejection.NodeLocked;
    }, [composition, adapter, tryApply, applyAll, authoringTemplate, measureBox]);

    const canRemove = (elementId: string) => !isSlotSection(elementId) && isRemovable(composition.roots, elementId, adapter);

    const remove = (elementId: string) => {
        if (!canRemove(elementId)) return;
        const next = selectionAfterRemoval(composition.roots, elementId, adapter);
        if (tryApply(toRemoveNodeEdit(elementId), 'Remove').applied) setSelectedId(current => current === elementId || current === undefined ? next : current);
    };

    return {
        move,
        insertElement: (element: SceneElement, parentId: string | undefined, index: number | undefined, label: string, at?: CanvasPlacement) => insert(element, parentId, index, label, at),
        remove,
        canRemove,
        validateMove: (edit: Parameters<ScreenEditorController['validateMove']>[0]) => isSlotSection(edit.nodeId) ? StructureEditRejection.NodeLocked : validateStructureEdit(composition.roots, edit, adapter),
        insertComponent: (componentName: string, parentId: string | undefined, index: number | undefined, at?: CanvasPlacement) => insert(createExternalComponent(nextElementId(), componentName, componentName), parentId, index, 'Add', at, componentName),
        insertLayout: (item: Parameters<ScreenEditorController['insertLayout']>[0], parentId: string | undefined, index: number | undefined, at?: CanvasPlacement) => insert(createPanel(item, nextElementId(), item), parentId, index, 'Add layout', at, `layout:${item}`),
    };
};
