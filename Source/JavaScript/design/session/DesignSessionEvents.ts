// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignOperation, TweakControl } from '../operations/DesignOperation';
import { DesignSubject } from '../subject/DesignSubject';
import { DesignMode } from './DesignSession';

/** A design session began, on a subject, in a mode and - when it is constrained - with the templates it may use. */
export interface DesignSessionStarted {
    type: 'DesignSessionStarted';
    sessionId: string;
    subject: DesignSubject;
    mode: DesignMode;
    templateSet?: string[];
    startedBy: string;
    /** The session whose screens this one starts from. */
    seededFromSessionId?: string;
}

/** The templates a session may use changed; absent or empty lifts the constraint. */
export interface DesignTemplateSetChanged {
    type: 'DesignTemplateSetChanged';
    templateSet?: string[];
}

/** A screen gained a revision, which is now its current one. */
export interface ScreenRevisionRecorded {
    type: 'ScreenRevisionRecorded';
    revisionId: string;
    screen: string;
    text: string;
    operations: DesignOperation[];
    prompt?: string;
    author: string;
    turnId?: string;
    designSystemVersion?: string;
    basisRevisionId?: string;
    restoredFromRevisionId?: string;
    originSessionId?: string;
    originRevisionId?: string;
}

/** A screen was taken out of the design. Its revisions stay in the history. */
export interface ScreenRemovedFromDesign {
    type: 'ScreenRemovedFromDesign';
    screen: string;
}

/** The screens were put in a new order. */
export interface ScreensReordered {
    type: 'ScreensReordered';
    screens: string[];
}

/** A screen went back to an earlier revision: a new revision that restores it. */
export interface ScreenReverted {
    type: 'ScreenReverted';
    revisionId: string;
    screen: string;
    toRevisionId: string;
    author: string;
    turnId?: string;
}

export interface ProposedVariation {
    id: string;
    text: string;
}

/** Layouts of a screen were asked for and offered. */
export interface VariationsProposed {
    type: 'VariationsProposed';
    groupId: string;
    screen: string;
    prompt?: string;
    candidates: ProposedVariation[];
}

/** One of the layouts became the screen's next revision. */
export interface VariationChosen {
    type: 'VariationChosen';
    groupId: string;
    candidateId: string;
    revisionId: string;
    author: string;
    turnId?: string;
}

export interface ProposedTweak extends TweakControl {
    id: string;
}

/** Tweak controls were offered for a screen, or for the design as a whole. */
export interface TweaksProposed {
    type: 'TweaksProposed';
    screen?: string;
    tweaks: ProposedTweak[];
}

export interface TweakDismissed {
    type: 'TweakDismissed';
    tweakId: string;
}

/** A comment was added to a screen, anchored to an element when one was under the pin. */
export interface CommentAdded {
    type: 'CommentAdded';
    commentId: string;
    screen: string;
    elementId?: string;
    text: string;
    author: string;
}

/** A comment anchored to no element was pinned to a position of its screen. */
export interface CommentPinned {
    type: 'CommentPinned';
    commentId: string;
    x: number;
    y: number;
}

export interface CommentResolved {
    type: 'CommentResolved';
    commentId: string;
}

export interface CommentReopened {
    type: 'CommentReopened';
    commentId: string;
}

export type DesignSessionEvent =
    | DesignSessionStarted | DesignTemplateSetChanged
    | ScreenRevisionRecorded | ScreenRemovedFromDesign | ScreensReordered | ScreenReverted
    | VariationsProposed | VariationChosen | TweaksProposed | TweakDismissed
    | CommentAdded | CommentPinned | CommentResolved | CommentReopened;

export type DesignSessionEventType = DesignSessionEvent['type'];
