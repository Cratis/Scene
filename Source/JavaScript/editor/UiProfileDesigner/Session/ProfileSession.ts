// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// One step in the history: the profile as it was before an edit, and what the edit was called.
interface ProfileStep<T> {
    before: T;
    label: string;
}

// The profile being designed, its history and whether it differs from what was last stored. Immutable: every operation
// returns a new session, exactly like the screen editor's `EditSession` - the profile designer undoes, redoes and tracks
// "unsaved" the same way, it only holds a different document.
export interface ProfileSession<T> {
    document: T;
    undoable: readonly ProfileStep<T>[];
    redoable: readonly ProfileStep<T>[];

    // Whether the document differs from the one last marked saved.
    isDirty: boolean;
    savedDocument: T;

    // How two documents are told apart; reference equality unless the document type says otherwise (a profile compares by value).
    equals: (left: T, right: T) => boolean;

    // The last edit and when it was made, so a run of the same edit - typing a name, dragging an accent - is one step to undo, not one per keystroke.
    lastEdit?: { label: string; at: number };
}

// How long after an edit the same edit is still the same step. A pause longer than this starts a new one.
export const mergeWindowMilliseconds = 1000;

// The most steps kept; older ones fall off so a long session does not grow without bound.
export const maximumProfileHistory = 100;

export function openProfileSession<T>(document: T, equals: (left: T, right: T) => boolean = Object.is): ProfileSession<T> {
    return { document, undoable: [], redoable: [], isDirty: false, savedDocument: document, equals };
}

// Records one edit as one undo step and clears anything that could have been redone. An edit that leaves the document
// untouched (same value) records nothing.
export function changeProfile<T>(session: ProfileSession<T>, document: T, label: string, at: number = Date.now()): ProfileSession<T> {
    if (session.equals(document, session.document)) return session;
    const last = session.undoable[session.undoable.length - 1];
    const merging = last !== undefined && session.lastEdit?.label === label && at - session.lastEdit.at <= mergeWindowMilliseconds && session.redoable.length === 0;
    return {
        ...session,
        document,
        // The step already on the stack keeps the profile as it was before the run began; undoing it takes the whole run back.
        undoable: merging ? session.undoable : [...session.undoable, { before: session.document, label }].slice(-maximumProfileHistory),
        redoable: [],
        isDirty: !session.equals(document, session.savedDocument),
        lastEdit: { label, at },
    };
}

export const canUndoProfile = <T>(session: ProfileSession<T>): boolean => session.undoable.length > 0;
export const canRedoProfile = <T>(session: ProfileSession<T>): boolean => session.redoable.length > 0;

export function undoProfile<T>(session: ProfileSession<T>): ProfileSession<T> {
    const step = session.undoable[session.undoable.length - 1];
    if (!step) return session;
    return {
        ...session,
        document: step.before,
        lastEdit: undefined,
        undoable: session.undoable.slice(0, -1),
        redoable: [...session.redoable, { before: session.document, label: step.label }],
        isDirty: !session.equals(step.before, session.savedDocument),
    };
}

export function redoProfile<T>(session: ProfileSession<T>): ProfileSession<T> {
    const step = session.redoable[session.redoable.length - 1];
    if (!step) return session;
    return {
        ...session,
        document: step.before,
        lastEdit: undefined,
        undoable: [...session.undoable, { before: session.document, label: step.label }],
        redoable: session.redoable.slice(0, -1),
        isDirty: !session.equals(step.before, session.savedDocument),
    };
}

// The label of the edit undo would take back, for "Undo <label>"; nothing when there is none.
export const nextUndoLabel = <T>(session: ProfileSession<T>): string | undefined => session.undoable[session.undoable.length - 1]?.label;

// The label of the edit redo would bring back.
export const nextRedoLabel = <T>(session: ProfileSession<T>): string | undefined => session.redoable[session.redoable.length - 1]?.label;

// The document as stored now: no longer dirty, history kept. Pass the document that was actually stored - an edit made while
// the save was in flight stays unsaved.
export function markProfileSaved<T>(session: ProfileSession<T>, stored: T = session.document): ProfileSession<T> {
    return { ...session, savedDocument: stored, isDirty: !session.equals(session.document, stored) };
}

// Replaces the document without recording history - what was stored changed from elsewhere, so the session starts afresh.
export const resetProfileSession = <T>(document: T, equals?: (left: T, right: T) => boolean): ProfileSession<T> => openProfileSession(document, equals);
