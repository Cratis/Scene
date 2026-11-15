// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignOperation, TweakControl } from '../operations/DesignOperation';
import { DesignSubject } from '../subject/DesignSubject';

/** What a session designs: screens, or - in template mode - screen templates destined for a design-system draft. */
export type DesignMode = 'screens' | 'templates';

/** The revision a screen was copied from when a session was seeded from another. */
export interface RevisionOrigin {
    sessionId: string;
    revisionId: string;
}

/** A screen of the session and the revision that is its current one. Only the current revision is written into the host's Screenplay. */
export interface ScreenEntry {
    screen: string;
    currentRevision: string;
}

/**
 * One state of a screen. It stores Screenplay text; turning that into a Scene document and back is the caller's, with Cratis.Scene.Screenplay.
 * A turn that touches several screens records one revision per screen, all with the same turn id.
 */
export interface Revision {
    id: string;
    screen: string;
    text: string;
    operations: DesignOperation[];
    prompt?: string;
    author: string;
    turnId?: string;
    designSystemVersion?: string;
    /** The revision this one was made from. */
    basisRevision?: string;
    /** The earlier revision this one restores: a revert is a new revision, never a deletion. */
    restoredFrom?: string;
    /** The revision of another session this one was copied from. */
    origin?: RevisionOrigin;
}

export interface VariationCandidateRecord {
    id: string;
    text: string;
}

/** Layouts of a screen asked for together. Choosing one makes it the screen's next revision; the others stay in the history. */
export interface VariationGroup {
    id: string;
    screen: string;
    prompt?: string;
    candidates: VariationCandidateRecord[];
    chosen?: string;
}

/** A tweak control that stays with the screen until it is dismissed. */
export interface TweakRecord extends TweakControl {
    id: string;
    screen?: string;
    dismissed: boolean;
}

export interface CommentPosition {
    x: number;
    y: number;
}

/** A comment on a screen, anchored to the element's stable id; a position only when no element is under the pin (a `CommentPinned` event sets it). */
export interface DesignComment {
    id: string;
    screen: string;
    elementId?: string;
    position?: CommentPosition;
    text: string;
    author: string;
    resolved: boolean;
}

/**
 * Everything a design remembers: the screens and how they came to be, the variations asked for, the tweaks on offer and the comments.
 * The model holds the decisions and the session holds the exploration. Hosts persist it as events and fold them with `reduceDesignSession`.
 */
export interface DesignSession {
    id: string;
    subject: DesignSubject;
    mode: DesignMode;
    /** The templates the session may use; absent when it is not constrained. */
    templateSet?: string[];
    /** The session this one was seeded from. */
    seededFrom?: string;
    startedBy: string;
    screens: ScreenEntry[];
    revisions: Revision[];
    variationGroups: VariationGroup[];
    tweaks: TweakRecord[];
    comments: DesignComment[];
}

export const currentRevisionOf = (session: DesignSession, screen: string): Revision | undefined => {
    const entry = session.screens.find(candidate => candidate.screen === screen);
    return entry === undefined ? undefined : session.revisions.find(revision => revision.id === entry.currentRevision);
};

export const revisionsOf = (session: DesignSession, screen: string): Revision[] => session.revisions.filter(revision => revision.screen === screen);
