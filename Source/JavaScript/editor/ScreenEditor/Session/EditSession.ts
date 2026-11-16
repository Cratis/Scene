// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDiagnostic, SceneDocument, SceneEdit } from '@cratis/scene.model';
import { applyEdit, type EditingContext } from '@cratis/scene.engine';

// One step in the history: the document as it was before an edit.
interface Step {
    before: SceneDocument;
    label: string;
}

// The document, its history and what the last edit said. Immutable: every operation returns a new session.
export interface ScreenEditSession {
    document: SceneDocument;
    undoable: readonly Step[];
    redoable: readonly Step[];
    diagnostics: SceneDiagnostic[];

    // Whether anything was applied since the session was opened or last marked saved.
    isDirty: boolean;
    savedDocument: SceneDocument;
}

// The most steps of history kept; older ones fall off so a long session does not grow without bound.
export const maximumHistory = 100;

export function openSession(document: SceneDocument): ScreenEditSession {
    return { document, undoable: [], redoable: [], diagnostics: [], isDirty: false, savedDocument: document };
}

// Applies an edit through Scene's own `applyEdit`. A refused edit leaves the document and the history exactly as they
// were and reports why; an applied one becomes one undo step and clears anything that could have been redone.
export function applyToSession(session: ScreenEditSession, edit: SceneEdit, context: EditingContext, label: string): ScreenEditSession {
    const outcome = applyEdit(session.document, edit, context);
    if (!outcome.applied) return { ...session, diagnostics: outcome.diagnostics };

    return {
        ...session,
        document: outcome.model,
        undoable: [...session.undoable, { before: session.document, label }].slice(-maximumHistory),
        redoable: [],
        diagnostics: outcome.diagnostics,
        isDirty: outcome.model !== session.savedDocument,
    };
}

// Applies a document-level authoring change that Scene models in the document contract but not yet as a SceneEdit.
export function changeDocumentInSession(session: ScreenEditSession, document: SceneDocument, label: string): ScreenEditSession {
    if (document === session.document) return session;
    return {
        ...session,
        document,
        undoable: [...session.undoable, { before: session.document, label }].slice(-maximumHistory),
        redoable: [],
        diagnostics: [],
        isDirty: document !== session.savedDocument,
    };
}

// Applies several edits as one undo step - a single user action that Scene models as more than one edit.
export function applyAllToSession(session: ScreenEditSession, edits: SceneEdit[], context: EditingContext, label: string): ScreenEditSession {
    let document = session.document;
    const diagnostics: SceneDiagnostic[] = [];
    for (const edit of edits) {
        const outcome = applyEdit(document, edit, context);
        diagnostics.push(...outcome.diagnostics);
        if (!outcome.applied) return { ...session, diagnostics };
        document = outcome.model;
    }

    return {
        ...session,
        document,
        undoable: [...session.undoable, { before: session.document, label }].slice(-maximumHistory),
        redoable: [],
        diagnostics,
        isDirty: document !== session.savedDocument,
    };
}

export const canUndo = (session: ScreenEditSession): boolean => session.undoable.length > 0;
export const canRedo = (session: ScreenEditSession): boolean => session.redoable.length > 0;

export function undo(session: ScreenEditSession): ScreenEditSession {
    const step = session.undoable[session.undoable.length - 1];
    if (!step) return session;
    return {
        ...session,
        document: step.before,
        undoable: session.undoable.slice(0, -1),
        redoable: [...session.redoable, { before: session.document, label: step.label }],
        diagnostics: [],
        isDirty: step.before !== session.savedDocument,
    };
}

export function redo(session: ScreenEditSession): ScreenEditSession {
    const step = session.redoable[session.redoable.length - 1];
    if (!step) return session;
    return {
        ...session,
        document: step.before,
        undoable: [...session.undoable, { before: session.document, label: step.label }],
        redoable: session.redoable.slice(0, -1),
        diagnostics: [],
        isDirty: step.before !== session.savedDocument,
    };
}

// Replaces the document without recording history - for opening, converting or reloading what was saved.
export function resetSession(document: SceneDocument): ScreenEditSession {
    return openSession(document);
}

export function markSaved(session: ScreenEditSession): ScreenEditSession {
    return { ...session, savedDocument: session.document, isDirty: false };
}
