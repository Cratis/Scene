// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { type DesignOperation, type DesignSession, type DesignSessionEvent, type Revision, currentRevisionOf, revisionsOf } from '@cratis/scene.design';
import type { DesignIds } from '../Host/DesignCanvasHost';

/** How a revision came to be. */
export type RevisionKind = 'created' | 'edited' | 'restored' | 'variation' | 'seeded';

/** One revision of a screen as the history panel lists it. */
export interface HistoryEntry {
    revision: Revision;
    kind: RevisionKind;
    /** Whether it is the revision the screen is at. */
    current: boolean;
    /** What it did, in words: the prompt, or what its operations did. */
    summary: string;
    /** The other screens the same turn changed. */
    alsoChanged: string[];
}

/** An operation in words, for a history that says what happened without anyone reading Screenplay. */
export function describeOperation(operation: DesignOperation): string {
    switch (operation.op) {
        case 'addScreen': return `Added the screen ${operation.name}`;
        case 'removeScreen': return `Removed the screen ${operation.name}`;
        case 'moveScreen': return `Moved ${operation.name} to position ${operation.index + 1}`;
        case 'addTemplate': return `Added the template ${operation.name}`;
        case 'addSlot': return `Added the slot ${operation.slot.name} to ${operation.template}`;
        case 'removeSlot': return `Removed the slot ${operation.slot} from ${operation.template}`;
        case 'arrange': return `Arranged the slots of ${operation.template}`;
        case 'insert': return `Added ${operation.component} to ${operation.outlet}`;
        case 'set': return `Set ${operation.prop} of ${operation.element} to ${String(operation.value)}`;
        case 'remove': return `Removed ${operation.element}`;
        case 'move': return `Moved ${operation.element} to ${operation.outlet}`;
        case 'link': return `Linked ${operation.element} to ${operation.to}`;
        case 'profile': return `Changed the ${operation.key} to ${operation.value}`;
        case 'variations': return `Asked for other layouts of ${operation.screen}`;
        case 'tweaks': return 'Offered tweaks';
        case 'refuse': return operation.reason;
    }
}

function kindOf(session: DesignSession, revision: Revision, previous: Revision | undefined): RevisionKind {
    if (revision.restoredFrom !== undefined) return 'restored';
    if (revision.origin !== undefined) return 'seeded';
    if (previous === undefined) return 'created';
    const chosen = session.variationGroups.some(group => group.screen === revision.screen && group.chosen !== undefined
        && group.candidates.find(candidate => candidate.id === group.chosen)?.text === revision.text && revision.operations.length === 0 && revision.prompt === undefined);
    return chosen ? 'variation' : 'edited';
}

function summaryOf(entry: Revision, kind: RevisionKind): string {
    if (entry.prompt !== undefined && entry.prompt !== '') return entry.prompt;
    if (kind === 'restored') return `Went back to ${entry.restoredFrom}`;
    if (kind === 'variation') return 'Chose another layout';
    if (kind === 'seeded') return 'Copied from the design it came from';
    if (entry.operations.length > 0) return entry.operations.map(describeOperation).join('; ');
    return kind === 'created' ? 'Created' : 'Edited by hand';
}

/** The revisions of a screen, newest first, each with what it did. Nothing is ever dropped: a revert is a revision of its own. */
export function historyOf(session: DesignSession, screen: string): HistoryEntry[] {
    const revisions = revisionsOf(session, screen);
    const current = currentRevisionOf(session, screen);
    return revisions.map((revision, index) => {
        const kind = kindOf(session, revision, revisions[index - 1]);
        const alsoChanged = revision.turnId === undefined ? [] : session.revisions.filter(other => other.turnId === revision.turnId && other.screen !== screen).map(other => other.screen);
        return { revision, kind, current: current?.id === revision.id, summary: summaryOf(revision, kind), alsoChanged: [...new Set(alsoChanged)] };
    }).reverse();
}

/** The event that takes a screen back to an earlier revision, as a new revision. Nothing when the screen is already there. */
export function revertEvents(session: DesignSession, screen: string, toRevisionId: string, author: string, ids: DesignIds, turnId?: string): DesignSessionEvent[] {
    const target = session.revisions.find(revision => revision.id === toRevisionId && revision.screen === screen);
    const current = currentRevisionOf(session, screen);
    if (target === undefined || current === undefined || current.id === target.id) return [];
    return [{ type: 'ScreenReverted', revisionId: ids.next('revision'), screen, toRevisionId, author, ...(turnId === undefined ? {} : { turnId }) }];
}

/**
 * The events that undo a whole turn: every screen it changed goes back to the revision it was made from - one new revision each, with a shared
 * turn id - and a screen the turn created is taken out. A screen changed since the turn is left alone: reverting must never undo later work.
 */
export function revertTurnEvents(session: DesignSession, turnId: string, author: string, ids: DesignIds, revertTurnId: string): DesignSessionEvent[] {
    const events: DesignSessionEvent[] = [];
    for (const revision of session.revisions.filter(candidate => candidate.turnId === turnId)) {
        if (currentRevisionOf(session, revision.screen)?.id !== revision.id) continue;
        if (revision.basisRevision === undefined) events.push({ type: 'ScreenRemovedFromDesign', screen: revision.screen });
        else events.push(...revertEvents(session, revision.screen, revision.basisRevision, author, ids, revertTurnId));
    }
    return events;
}

/** The turns that can still be undone as one: those whose every revision is still the current one of its screen. */
export function revertibleTurns(session: DesignSession): string[] {
    const turns = [...new Set(session.revisions.map(revision => revision.turnId).filter((turn): turn is string => turn !== undefined))];
    return turns.filter(turn => session.revisions.filter(revision => revision.turnId === turn).some(revision => currentRevisionOf(session, revision.screen)?.id === revision.id));
}
