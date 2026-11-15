// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useMemo, useRef, useState } from 'react';
import { PropertyValueType } from '@cratis/scene.model';
import { elementNodeId, inspect } from '@cratis/scene.engine';
import type { OutletEditingLevel } from '../Outlets/outletDocument';
import { useDocumentSetters } from './useDocumentSetters';
import { useEditApplication } from './useEditApplication';
import { useEditingScene } from './useEditingScene';
import { useNavigationEditing } from './useNavigationEditing';
import { useStructureOperations } from './useStructureOperations';
import { sceneScreenDraftSession } from '../Drafting/sceneScreenDraftSession';
import type { SceneScreenDraftStrings } from '../Drafting/SceneScreenDraftStrings';
import { type BoxMeasure } from '../Document/canvasMoveEdits';
import { editForValue } from '../Properties/propertyEdits';
import { SessionCell } from '../Session/SessionCell';
import { canRedo, canUndo, markSaved, openSession, redo, undo, type ScreenEditSession } from '../Session/EditSession';
import { findSceneElement } from '../Selection/sceneTree';
import { documentWithChrome } from '../Templates/dialogActionsChrome';
import type { ElementMeasurer, ScreenEditorController } from './ScreenEditorController';
import type { OpenedSubject } from './openSubject';
import type { ScreenEditorEnvironment } from './ScreenEditorHost';
import { nextElementId } from './nextElementId';
import { generateForm, insertDataField, removeQueryColumn, type DataFieldInsertion } from '../Data/insertDataField';

// The editing state of one open screen: the document and its history, what is selected, and every operation the
// surface and the inspector perform. Each operation is expressed as a Scene edit and goes through the one session, so a
// change from the surface, the Structure tree, the Properties tab or the keyboard is held to the same rules and is
// undone the same way.

// Called once for each component or layout container that went onto the screen - by a click in the picker, a drop on the surface or the keyboard -
// with the key the picker lists it under (`package:name`, `layout:Item`). Only an insert that was applied counts (PICK4).
export type ComponentInsertedListener = (key: string) => void;

// What the host decides for the editor session: the draft texts (or undefined for the editor defaults) and who hears of an insert.
export interface ScreenEditorSessionOptions {
    draftStrings: SceneScreenDraftStrings | undefined;
    onInserted?: ComponentInsertedListener;
}

export function useScreenEditor(opened: OpenedSubject, authoringTemplate: string | undefined, environment: ScreenEditorEnvironment, options: ScreenEditorSessionOptions): ScreenEditorController {
    const { draftStrings, onInserted } = options;
    const [session, setSession] = useState<ScreenEditSession>(() => openSession(opened.document));

    // Edits are worked out from the latest session, not the one this render holds, so two edits in one tick - a drop and a
    // keyboard move, or a confirmed layout change - build on each other instead of the second overwriting the first.
    const cellRef = useRef<SessionCell>(undefined as unknown as SessionCell);
    cellRef.current ??= new SessionCell(session, setSession);
    const cell = cellRef.current;
    const commit = useCallback((change: (current: ScreenEditSession) => ScreenEditSession) => cell.commit(change), [cell]);

    const [selectedId, setSelectedId] = useState<string | undefined>(opened.select?.componentId);
    const [pointedItem, setPointedItem] = useState<{ componentId: string; itemId: string } | undefined>(
        opened.select?.itemId === undefined ? undefined : { componentId: opened.select.componentId, itemId: opened.select.itemId });
    const [buttonToAdd, setButtonToAdd] = useState(() => opened.select?.add && opened.select.componentId ? { componentId: opened.select.componentId, button: opened.select.add } : undefined);
    const settleButtonToAdd = useCallback(() => setButtonToAdd(undefined), []);
    const [outletLevel, setOutletLevel] = useState<OutletEditingLevel | undefined>();

    // How big the surface drew an element, once there is a surface to ask: what an element added without a drop point is placed clear of.
    const measurer = useRef<ElementMeasurer | undefined>(undefined);
    const measureBox = useCallback<BoxMeasure>((elementId, canvasId) => {
        const box = measurer.current?.(elementId);
        const canvas = measurer.current?.(canvasId);
        return box && canvas ? { height: box.height, bottom: box.top + box.height - canvas.top } : undefined;
    }, []);
    const setMeasurer = useCallback((measure: ElementMeasurer | undefined) => { measurer.current = measure; }, []);

    const { context, composition, ownershipOf, adapter, authored, dropRegions } = useEditingScene(session.document, authoringTemplate, environment, opened.opensOverPage);
    const selection = selectedId ? findSceneElement(composition.roots, selectedId) : undefined;
    const inspection = useMemo(
        () => selectedId ? inspect(composition.chrome.some(element => element.id === selectedId) ? documentWithChrome(session.document, composition.chrome) : session.document, elementNodeId(selectedId), context) : undefined,
        [session.document, composition, selectedId, context]);

    const { tryApply, apply, applyAll } = useEditApplication(cell, commit, context);
    const operations = useStructureOperations({ cell, composition, authored, adapter, authoringTemplate, measureBox, tryApply, applyAll, setSelectedId, onInserted });
    const documentSetters = useDocumentSetters(commit, environment);
    const navigationEditing = useNavigationEditing(session.document, cell, commit, environment);

    const selectItem = useCallback((componentId: string | undefined, itemId: string | undefined) => {
        setPointedItem(componentId && itemId ? { componentId, itemId } : undefined);
    }, []);

    const dataInsertion: DataFieldInsertion = {
        controller: {
            document: session.document,
            composition,
            insertElement: operations.insertElement,
            setScreenForms: documentSetters.setScreenForms,
            select: setSelectedId,
            apply,
        },
        packages: environment.runtime.packages,
        stateChangeSlices: environment.stateChangeSlices,
        queryCandidates: environment.queryCandidates,
        bindsQuery: componentName => environment.runtime.descriptors.some(descriptor => descriptor.component === componentName && descriptor.properties.some(property => property.valueType === PropertyValueType.QueryReference)),
        newId: nextElementId,
    };

    return {
        ...navigationEditing,
        ...operations,
        ...documentSetters,
        selectedItemId: pointedItem && pointedItem.componentId === selectedId ? pointedItem.itemId : undefined,
        selectItem,
        buttonToAdd,
        settleButtonToAdd,
        opensOverPage: opened.opensOverPage === true,
        document: session.document, ...sceneScreenDraftSession(cell, environment.runtime, context, draftStrings),
        composition,
        context,
        selectedId,
        selection,
        inspection,
        diagnostics: session.diagnostics,
        adapter,
        ownershipOf,
        dropRegions,
        select: setSelectedId,
        setMeasurer,
        apply,
        tryApply,
        applyAll,
        insertDataField: (field, parentId, index, at, over) => insertDataField(field, { parentId, index, at, over }, dataInsertion),
        generateForm: (sliceId, parentId, index) => generateForm(sliceId, { parentId, index }, dataInsertion),
        removeDataField: field => removeQueryColumn(field, dataInsertion),
        setProperty: (property, value) => selectedId && apply(editForValue(selectedId, property, value), 'Change'),
        outletLevel,
        setOutletLevel,
        markSaved: () => { commit(markSaved); },
        undo: () => { commit(undo); },
        redo: () => { commit(redo); },
        canUndo: canUndo(session),
        canRedo: canRedo(session),
        isDirty: session.isDirty,
    };
}
