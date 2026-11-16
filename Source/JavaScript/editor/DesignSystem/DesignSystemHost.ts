// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import type { DesignSystem } from '@cratis/scene.model';
import type { DesignSystemConflictEntry } from './Conflicts/DesignSystemConflict';
import type { DesignSystemPreview } from './Previewing/DesignSystemPreview';
import type { DesignChange } from './Resolving/designEdits';
import type { OffStandardEntry, OffStandardIssue, OffStandardScreen } from './Standard/offStandardEntries';

/** What happened to a design system version. */
export type DesignSystemHistoryKind =
    'draftStarted'
    | 'draftRevised'
    | 'draftRevisedByAssistant'
    | 'draftSubmittedForReview'
    | 'draftDiscarded'
    | 'activated';

/** One entry in a design system's history. */
export interface DesignSystemHistoryEntry {
    /** The version it concerns. */
    version: number;

    /** What happened. */
    kind: DesignSystemHistoryKind;

    /** Who did it. */
    by: string;

    /** When, as the host writes a time. Not read by the editor. */
    at?: string;

    /** What was said about it. Not read by the editor. */
    note?: string;
}

/** What a version's Screenplay declares besides the design system: the profile applications are drawn with, and the layouts and templates. */
export interface DesignSystemOutline {
    /** The UI profile's name. */
    profile?: string;

    /** The theme the profile draws. */
    theme?: string;

    /** The template the profile's shell is. */
    rootTemplate?: string;

    /** The platforms the profile targets. */
    platforms: string[];

    /** The component packages the profile lists. */
    packages: string[];

    /** The layouts. */
    layouts: string[];

    /** The screen templates. */
    screenTemplates: string[];

    /** The dialog templates. */
    dialogTemplates: string[];
}

/** One version of a design system - the active one or the draft. */
export interface DesignSystemVersion {
    /** The version number. */
    number: number;

    /** The revision of this version's text. The editor hands it back with every change, so the host can refuse a change made against text that has moved on. */
    revision: number;

    /** The design system the version declares, resolved. Absent when the version's Screenplay could not be read as one. */
    designSystem?: DesignSystem;

    /** The Screenplay text of the version, exactly as the compiler accepted it. */
    screenplay: string;

    /** What the Screenplay declares besides the design system. */
    outline: DesignSystemOutline;

    /** Who started the version. */
    authoredBy?: string;
}

/** Everything the editor shows, as the host last read it. */
export interface DesignSystemState {
    /** The version that is the standard. Absent when there is none yet. */
    active?: DesignSystemVersion;

    /** The draft being worked on. Absent when none is open. */
    draft?: DesignSystemVersion;

    /** What has happened to the versions, newest first. */
    history: DesignSystemHistoryEntry[];

    /** The conflicts found in what the design system was established from, for the open draft. Absent for none. */
    conflicts?: DesignSystemConflictEntry[];
}

/**
 * What the host answers when the editor asks it to do something: nothing when it was done, or the reason it was not.
 * The editor shows the reason, stays where it is and keeps what the person had entered.
 */
export type DesignSystemRefusal = string | undefined;

/** A question the editor asks before a decision that is hard to take back. */
export interface DesignSystemConfirmation {
    /** The question. */
    title: string;

    /** What answering yes does, and what it does not. */
    message: string;
}

/** The people and effects around the conflicts of a draft. A host that finds none leaves it out. */
export interface DesignSystemConflictsHost {
    /** Keeps one of the values competing in a conflict. The draft follows; the editor reloads afterwards. */
    decide: (entry: DesignSystemConflictEntry, chosen: string) => Promise<DesignSystemRefusal>;

    /** Raises an issue for the code that should change. Absent when the host cannot - the control is not offered. */
    raiseIssue?: (entry: DesignSystemConflictEntry) => Promise<DesignSystemRefusal>;
}

/** What is outside the design system in the designs the host holds, and the ways of bringing it back. A host with no designs to check leaves it out. */
export interface DesignSystemStandardHost {
    /** Finds what the current version of each screen has outside the active design system. */
    find: () => Promise<readonly OffStandardScreen[]>;

    /** Raises one issue for some of it. Absent when the host cannot - the control is not offered. */
    raiseIssue?: (issue: OffStandardIssue) => Promise<DesignSystemRefusal>;

    /** Writes the suggested token in place of the value, on every screen that uses it. Absent when the host cannot. */
    useToken?: (entry: OffStandardEntry, replacement: string) => Promise<DesignSystemRefusal>;

    /** Proposes the value to the design system - the host's way of changing the draft for it (a person's request to an assistant, say). Absent when the host cannot. */
    propose?: (entry: OffStandardEntry) => Promise<DesignSystemRefusal>;
}

/** Drawing the draft on the host's screens beside the active version. A host that cannot draw leaves it out. */
export interface DesignSystemPreviewHost {
    /** Whether the host can draw now. When it cannot, the editor says so and offers no control. */
    available: boolean;

    /** Draws the screens. */
    draw: () => Promise<DesignSystemPreview>;
}

/** What a host passes the render function of a section it adds. */
export interface DesignSystemSectionContext {
    /** The state as last read. */
    state: DesignSystemState;

    /** The theme shown. */
    theme: string;

    /** The mode shown. */
    mode: string;

    /** Reads the state again - after the section changed something. */
    reload: () => Promise<void>;
}

/** A section the host adds to the editor's navigation, drawn by the host. */
export interface DesignSystemExtraSection {
    /** The section's identity, which must not be one of the editor's own. */
    id: string;

    /** What it is called in the navigation. */
    label: string;

    /** The navigation group it sits in; sections of one group are listed together, after the editor's own. */
    group: string;

    /** Draws the section. */
    render: (context: DesignSystemSectionContext) => ReactNode;
}

/**
 * Everything the design system editor asks of the application that embeds it. The editor reads a design system and shows it;
 * it keeps no state of its own about the product, sends nothing anywhere and has no Arc client, router or authorization.
 * Every effect leaves through a member of this interface and each member answers with what it did.
 *
 * A member the host leaves out is not offered: the editor hides the control, or says why it is unavailable, and never does
 * the thing silently.
 */
export interface DesignSystemHost {
    /** Who is looking - the name history entries carry. Someone who wrote part of a draft may not activate it. */
    person: string;

    /** Reads the design system's versions, history and conflicts. Called when the editor opens and after every change. */
    load: () => Promise<DesignSystemState>;

    /** Starts a draft: from the active version, or from the starter when there is none. */
    startDraft: () => Promise<DesignSystemRefusal>;

    /**
     * Makes changes to the draft, together, in the draft's text.
     *
     * @param version The draft's number.
     * @param expectedRevision The revision of the draft the person changed. The host refuses the changes when the draft has moved on.
     * @param changes The changes, by address.
     */
    changeDraft: (version: number, expectedRevision: number, changes: readonly DesignChange[]) => Promise<DesignSystemRefusal>;

    /** Throws the draft away. The active version is not touched. */
    discardDraft: (version: number) => Promise<DesignSystemRefusal>;

    /** Puts the draft up for review. Absent when the host has no review step - the control is not offered. */
    submitDraft?: (version: number, expectedRevision: number) => Promise<DesignSystemRefusal>;

    /** Makes the draft the active version. */
    activateDraft: (version: number, expectedRevision: number) => Promise<DesignSystemRefusal>;

    /** Asks the person a question. Absent: the editor asks in its own bar above the sections. */
    confirm?: (confirmation: DesignSystemConfirmation) => Promise<boolean>;

    /** Conflicts found in what the design system was established from. */
    conflicts?: DesignSystemConflictsHost;

    /** What the designs have outside the design system. */
    standard?: DesignSystemStandardHost;

    /** Drawing the draft on the screens. */
    preview?: DesignSystemPreviewHost;

    /** Sections the host adds. */
    sections?: readonly DesignSystemExtraSection[];
}
