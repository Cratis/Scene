// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, SceneDiagnostic, SceneDocument, SceneEdit, SceneEditKind } from '@cratis/scene.model';
import { errorDiagnostic, hasErrors } from './diagnostics';
import { EditOutcome } from './EditOutcome';
import { EditingContext } from './EditingContext';
import { EditSession } from './EditSession';
import { applyExposeProperty, applyUnexposeProperty } from './exposureEdits';
import {
    applyAddCollectionItem, applyEditCollectionItem, applyRemoveCollectionItem, applyReorderCollectionItem,
    applyResetInstanceValue, applySetInstanceValue,
} from './instanceEdits';
import { applyChangeLayoutType } from './layoutTypeEdits';
import { cloneData } from './pathAccess';
import { applyResetProperty, applySetProperty } from './propertyEdits';
import { applyInsertNode, applyMoveNode, applyRemoveNode } from './structureEdits';

type Handler<TEdit extends SceneEdit> = (session: EditSession, edit: TEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]) => void;

function run(session: EditSession, edit: SceneEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    const handle = <TEdit extends SceneEdit>(handler: Handler<TEdit>) => handler(session, edit as TEdit, clone, diagnostics);

    switch (edit.kind) {
        case SceneEditKind.SetProperty: return handle(applySetProperty);
        case SceneEditKind.ResetProperty: return handle(applyResetProperty);
        case SceneEditKind.ChangeLayoutType: return handle(applyChangeLayoutType);
        case SceneEditKind.InsertNode: return handle(applyInsertNode);
        case SceneEditKind.MoveNode: return handle(applyMoveNode);
        case SceneEditKind.RemoveNode: return handle(applyRemoveNode);
        case SceneEditKind.SetInstanceValue: return handle(applySetInstanceValue);
        case SceneEditKind.ResetInstanceValue: return handle(applyResetInstanceValue);
        case SceneEditKind.AddCollectionItem: return handle(applyAddCollectionItem);
        case SceneEditKind.RemoveCollectionItem: return handle(applyRemoveCollectionItem);
        case SceneEditKind.ReorderCollectionItem: return handle(applyReorderCollectionItem);
        case SceneEditKind.EditCollectionItem: return handle(applyEditCollectionItem);
        case SceneEditKind.ExposeProperty: return handle(applyExposeProperty);
        case SceneEditKind.UnexposeProperty: return handle(applyUnexposeProperty);
        default:
            diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, `'${(edit as { kind?: string }).kind}' is not an edit this engine knows.`));
    }
}

/**
 * Applies one edit to a document.
 *
 * Pure and immutable: the document passed in is never changed, and the result is a new document. Edits are plain
 * data, so a host can persist them and build undo and redo by keeping the documents either side. On any error the
 * prior document comes back - the same object - together with the diagnostics, so a refused edit leaves nothing
 * half done.
 *
 * What an edit may touch follows the editing scope. Nodes the scope owns are edited directly; inherited nodes are
 * read-only, and their exposed properties are configured with the instance edits, which are checked against what
 * each owner exposed.
 *
 * @param model The document to edit.
 * @param edit What to do.
 * @param context The catalog and the editing scope.
 */
export function applyEdit(model: SceneDocument, edit: SceneEdit, context: EditingContext): EditOutcome {
    const session = new EditSession(model, context);
    const clone = cloneData(model);
    const diagnostics: SceneDiagnostic[] = [];

    run(session, edit, clone, diagnostics);

    if (hasErrors(diagnostics)) return { model, diagnostics, applied: false };
    return { model: clone, diagnostics, applied: true };
}
