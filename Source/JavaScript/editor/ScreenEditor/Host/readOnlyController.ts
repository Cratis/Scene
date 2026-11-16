// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { NodeInspection } from '@cratis/scene.model';
import { StructureEditRejection } from '../Structure/StructureEditRejection';
import type { ScreenEditorController } from './ScreenEditorController';

const nothing = () => undefined;
const notApplied = () => ({ applied: false, diagnostics: [] });

const lockedInspection = (inspection: NodeInspection | undefined, reason: string): NodeInspection | undefined => inspection && {
    ...inspection,
    removable: false,
    properties: inspection.properties.map(property => ({ ...property, editable: false, reason, operations: [] })),
};

// The same screen, for reading only: it can be selected, inspected and looked around in, but every edit is refused, the
// inspector shows each property locked with the reason, nothing can be dropped onto it and nothing is ever unsaved.
export const readOnlyController = (controller: ScreenEditorController, reason: string): ScreenEditorController => ({
    ...controller,
    readOnlyReason: reason,
    inspection: lockedInspection(controller.inspection, reason),
    dropRegions: [],
    applyNavigationEdits: () => ({ applied: false, rejected: reason }),
    apply: nothing,
    tryApply: notApplied,
    applyAll: notApplied,
    isSceneScreenDraftCurrent: () => false,
    prepareSceneScreenDraft: () => ({ problem: reason }),
    applySceneScreenDraft: () => ({ applied: false, problem: reason }),
    move: () => StructureEditRejection.NodeLocked,
    validateMove: () => StructureEditRejection.NodeLocked,
    insertComponent: nothing,
    insertLayout: nothing,
    insertElement: nothing,
    insertDataField: () => undefined,
    generateForm: () => undefined,
    removeDataField: nothing,
    remove: nothing,
    canRemove: () => false,
    setProperty: nothing,
    setScreenForms: nothing,
    setScreenTemplateSlots: nothing,
    changeDocument: () => ({ applied: false, rejected: reason }),
    setScreenTemplateMetadata: nothing,
    setDialogTemplates: nothing,
    setCollectionItemDestination: nothing,
    setElementBehaviors: nothing,
    setScreenTemplate: nothing,
    undo: nothing,
    redo: nothing,
    canUndo: false,
    canRedo: false,
    isDirty: false,
});
