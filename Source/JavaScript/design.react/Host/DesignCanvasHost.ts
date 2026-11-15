// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, UiProfile } from '@cratis/scene.model';
import type {
    DesignAlternative, DesignCatalogueInput, DesignMode, DesignSession, DesignSessionEvent, DesignSubject, DesignSystemProposal, Storyline,
} from '@cratis/scene.design';
import type { ScreenEditorEnvironment, ScreenEditorRuntime } from '@cratis/scene.editor';

/**
 * Where a design session lives. The canvas never owns the events: the host appends them to its own stream (Direct on the story or product,
 * Studio on the application) and tells the canvas when new ones arrive - from this canvas, from another tab or from the server's design turn.
 */
export interface DesignSessionStore {
    /** The events of the session so far, in order. Must return the same array until the events change, so a view can tell. */
    getEvents(): readonly DesignSessionEvent[];

    /** Calls the listener whenever events were added; answers the way to stop listening. */
    subscribe(listener: () => void): () => void;

    /** Appends events to the session's stream. Resolves once they are stored and visible through `getEvents`. */
    append(events: readonly DesignSessionEvent[]): Promise<void>;
}

/** One screen (or, in template mode, one screen template) as Screenplay text. */
export interface ScreenText {
    screen: string;
    text: string;
}

/**
 * Turns the Screenplay text a session stores into the Scene document the canvas draws and edits, and back. In .NET that is
 * `Cratis.Scene.Screenplay`; a host reaches it however it can - an endpoint of its own server, or a client-side compiler.
 */
export interface ScreenplayBridge {
    /**
     * The Scene document of the screens, which share one application: its layouts, templates and every screen under its name.
     * In template mode the texts are screen templates and they come back as the document's `screenTemplates`.
     */
    toDocument(texts: readonly ScreenText[], mode: DesignMode): Promise<SceneDocument>;

    /** The Screenplay text of one screen of the document, or - in template mode - of one screen template. */
    toText(document: SceneDocument, screen: string, mode: DesignMode): Promise<string>;
}

/** What the canvas asks the host's server to design: one turn of the conversation. */
export interface DesignTurnRequest {
    /** Shared by every revision the turn records, so a revert can undo the turn. */
    turnId: string;
    sessionId: string;
    subject: DesignSubject;
    mode: DesignMode;
    prompt: string;
    /** What the designer was looking at: the screen in focus and the element selected in it. */
    focus?: { screen?: string; element?: string };
    /** The templates the session may use; the server's catalogue and checks are restricted to them. */
    templateSet?: string[];
    /** Who is asking, so the revisions the turn records carry them. */
    author: string;
}

/** A thing said while a turn runs. */
export type DesignTurnProgress =
    | { kind: 'status'; message: string }
    | { kind: 'reply'; text: string }
    | { kind: 'screen'; screen: string };

/** An operation the turn would not apply, and what would be accepted instead. */
export interface DesignTurnRefusal {
    code: string;
    reason: string;
    alternatives: DesignAlternative[];
}

/** How a turn ended. The revisions it recorded arrive through the session store; this is what the chat shows. */
export interface DesignTurnResult {
    reply: string;
    refusals: DesignTurnRefusal[];
    /** Needs the design system lacks, to propose into its draft. */
    proposals: DesignSystemProposal[];
    /** The screens the turn changed. */
    touched: string[];
}

/** Runs a design turn on the host's server, which calls `Cratis.Scene.Design.AI`. The server records the turn's events itself. */
export interface DesignTurnTransport {
    runTurn(request: DesignTurnRequest, onProgress: (progress: DesignTurnProgress) => void, signal: AbortSignal): Promise<DesignTurnResult>;
}

/** What the catalogue is built from, and what draws it. */
export interface DesignCatalogueSource {
    /** The packages the screens are built from and the look they are drawn in. */
    runtime: ScreenEditorRuntime;

    /** The grounding of a design: descriptors, templates, design system, shapes, queries and commands. The session's template set is added by the canvas. */
    input(): DesignCatalogueInput;

    /** The environment the screen editor is opened with. Absent: the editor is built from the runtime alone. */
    editorEnvironment?: ScreenEditorEnvironment;

    /** The UI profile the screens are shown under, and the way to change it. */
    profile?: {
        current: UiProfile;
        change(profile: UiProfile): Promise<void>;
    };
}

/** The design system a proposal goes to. The canvas edits screens only; what the system lacks becomes a proposal in its draft. */
export interface DesignSystemProposals {
    /** A token, variant, word or component the design system lacks. */
    propose(proposal: DesignSystemProposal): Promise<void>;

    /** A screen template designed in template mode, as Screenplay text, for the design-system draft. */
    proposeTemplate?(proposal: TemplateDraftProposal): Promise<void>;
}

/** A screen template designed in template mode, on its way to the design-system draft. */
export interface TemplateDraftProposal {
    template: string;
    /** The template as Screenplay text: its slots, arrangement and outlets. */
    text: string;
    sessionId: string;
    revisionId: string;
}

/** The storylines of the screens besides the default one, which the host keeps in its Screenplay document. */
export interface StorylineStore {
    storylines(): readonly Storyline[];
    save(storylines: readonly Storyline[]): Promise<void>;
}

/** The person designing. */
export interface DesignUser {
    id: string;
    name: string;
}

/** Where the canvas sends the host's router. */
export interface DesignRouting {
    /** Opens the subject (story, issue, ...) a screen belongs to, optionally on a screen. Used by the screens overview to link back. */
    openSubject?(subject: DesignSubject, screen?: string): void;

    /** Called as the designer moves between screens, so a host can keep its address in step. */
    screenFocused?(screen: string | undefined): void;
}

/** Makes the ids of what the canvas records. Defaults to random ones. */
export interface DesignIds {
    next(kind: 'session' | 'turn' | 'revision' | 'group' | 'candidate' | 'tweak' | 'comment'): string;
}

/** Words the canvas shows, overridable by a host that localizes. */
export type DesignCanvasStrings = Partial<Record<DesignStringKey, string>>;

export type DesignStringKey =
    | 'chatPlaceholder' | 'send' | 'cancel' | 'working' | 'refused' | 'failed' | 'proposeToSystem' | 'proposed'
    | 'history' | 'revert' | 'undoTurn' | 'tweaks' | 'comments' | 'edit' | 'variations' | 'choose' | 'newScreen' | 'templates'
    | 'noScreens' | 'storylines' | 'defaultStoryline' | 'addComment' | 'resolve' | 'reopen' | 'templateSet' | 'allTemplates'
    | 'saveRevision' | 'discard' | 'screens' | 'openInSubject' | 'noTweaks' | 'noHistory' | 'noComments';

/** Everything the canvas needs from the application it is mounted in. */
export interface DesignCanvasHost {
    /** The session the canvas designs, persisted as the host's own events. The canvas is mounted once per subject. */
    session: DesignSessionStore;

    /** What the canvas is mounted for: a story, an issue, ... */
    subject: DesignSubject;

    /** The Screenplay bridge. */
    screenplay: ScreenplayBridge;

    /** Runs a design turn on the host's server. Absent: the canvas has no chat bar and edits by hand only. */
    ai?: DesignTurnTransport;

    /** The catalogue and everything that draws the screens. */
    catalogue: DesignCatalogueSource;

    /** The design system the proposals go to. Absent: proposals are shown but not sent. */
    designSystem?: DesignSystemProposals;

    /** The storylines besides the default one. Absent: only the default storyline. */
    storylines?: StorylineStore;

    /** The person designing. */
    user: DesignUser;

    /** The host's router. */
    routing?: DesignRouting;

    ids?: DesignIds;
    strings?: DesignCanvasStrings;
}

/** A screen as the canvas holds it: the session's current revision read into a document. */
export interface CanvasScreen {
    name: string;
    revisionId: string;
    text: string;
}

/** The summary of the session the canvas is showing. */
export interface CanvasSessionSummary {
    session: DesignSession;
    mode: DesignMode;
}
