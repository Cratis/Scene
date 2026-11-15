// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystem } from '@cratis/scene.model';
import { tokenAddress } from '@cratis/scene.engine';
import type { DesignSystemConflictEntry } from '../Conflicts/DesignSystemConflict';
import type {
    DesignSystemHistoryEntry,
    DesignSystemHost,
    DesignSystemOutline,
    DesignSystemRefusal,
    DesignSystemState,
    DesignSystemVersion,
} from '../DesignSystemHost';
import type { DesignSystemPreview } from '../Previewing/DesignSystemPreview';
import type { DesignChange } from '../Resolving/designEdits';
import type { OffStandardEntry, OffStandardIssue, OffStandardScreen } from '../Standard/offStandard';
import { applyDesignChanges } from './applyDesignChange';
import { sampleDesignSystem } from './sampleDesignSystem';

/** One thing the editor asked the fake host to do. */
export interface FakeHostCall {
    /** The member of the host. */
    member: string;

    /** What it was given. */
    args: unknown[];
}

/** What a fake host is built from. Everything is optional. */
export interface FakeDesignSystemHostOptions {
    /** Who is looking. Defaults to `ada`. */
    person?: string;

    /** The state to start from. Defaults to an active version v1 of the sample design system, and no draft. */
    state?: DesignSystemState;

    /** Starts with a draft open, written by the person looking. */
    draft?: boolean;

    /** Whether the host has a review step. Defaults to true. */
    review?: boolean;

    /** Conflicts to find in a draft. The host then offers deciding and raising an issue. */
    conflicts?: DesignSystemConflictEntry[];

    /** What the screens have outside the design system. The host then offers the ways of fixing it. */
    standard?: OffStandardScreen[];

    /** What the preview draws. The host then offers it. */
    preview?: DesignSystemPreview;

    /** Whether the host can draw the preview. Defaults to true when a preview is given. */
    previewAvailable?: boolean;

    /** A refusal for every action that changes something, so a story or a specification can show how the editor takes one. */
    refuse?: string;
}

/** A host that keeps a design system in memory and records what it was asked. */
export interface FakeDesignSystemHost extends DesignSystemHost {
    /** What the editor asked, in order. */
    readonly calls: FakeHostCall[];

    /** The state as it is now. */
    readonly state: DesignSystemState;

    /** Someone else looks from now on. */
    actAs: (person: string) => void;
}

/**
 * The outline of a design system the fake host declares for each version.
 *
 * @returns An outline with one layout and one screen template.
 */
export const sampleOutline = (): DesignSystemOutline => ({
    profile: 'Acme',
    theme: 'Acme',
    rootTemplate: 'Shell',
    platforms: ['web'],
    packages: ['PrimeReact', 'Cratis.Blueprint.Default'],
    layouts: ['AppShell'],
    screenTemplates: ['Workspaces.Sheet'],
    dialogTemplates: ['Workspaces.Confirm'],
});

/**
 * A few lines standing in for a design system's Screenplay: the host's text, which the editor shows read-only.
 *
 * @param design The design system.
 * @returns The text.
 */
export const sampleScreenplay = (design: DesignSystem | undefined): string => design === undefined
    ? ''
    : [
        `design system ${design.name}`,
        `    modes ${design.modes.join(', ')}`,
        ...design.tokens.map(role => `    token ${tokenAddress(role)}${role.description === undefined ? '' : ` - ${role.description}`}`),
        ...design.components.map(component => `    component ${component.name} (${component.variants.map(variant => variant.name).join(', ')})`),
        ...design.themes.map(theme => `theme ${theme.name}${theme.isDefault === true ? ' (default)' : ''}`),
    ].join('\n');

const versionOf = (number: number, designSystem: DesignSystem, authoredBy?: string, revision = 1): DesignSystemVersion => ({
    number,
    revision,
    designSystem,
    screenplay: sampleScreenplay(designSystem),
    outline: sampleOutline(),
    authoredBy,
});

/**
 * The state a fake host starts from when none is given: version 1 of the sample design system is the standard.
 *
 * @returns The state.
 */
export const sampleState = (): DesignSystemState => ({
    active: versionOf(1, sampleDesignSystem()),
    history: [{ version: 1, kind: 'activated', by: 'grace' }],
});

/**
 * Creates a host for the editor that keeps the design system in memory. A draft really changes - what is asked of it by address
 * is made to the design system - so a story can be edited by hand, and every call is recorded so a specification can say what the
 * editor asked for. It is what the editor's stories and specifications run against.
 *
 * @param options What it is built from.
 * @returns The host.
 */
export const createFakeDesignSystemHost = (options: FakeDesignSystemHostOptions = {}): FakeDesignSystemHost => {
    let person = options.person ?? 'ada';
    const state: DesignSystemState = structuredClone(options.state ?? sampleState());
    state.conflicts = state.conflicts ?? options.conflicts ?? [];
    const calls: FakeHostCall[] = [];
    let standard = structuredClone(options.standard ?? []);

    const record = (member: string, ...args: unknown[]) => { calls.push({ member, args }); };
    const note = (entry: Omit<DesignSystemHistoryEntry, 'by'>) => { state.history = [{ ...entry, by: person }, ...state.history]; };
    const refusal = (): DesignSystemRefusal => options.refuse;

    const host: FakeDesignSystemHost = {
        calls,
        get state() { return state; },
        actAs: name => { person = name; },
        get person() { return person; },

        load: async () => {
            record('load');
            return structuredClone(state);
        },

        startDraft: async () => {
            record('startDraft');
            if (refusal() !== undefined) return refusal();
            if (state.draft !== undefined) return 'A draft is already open.';
            const number = Math.max(0, ...state.history.map(entry => entry.version)) + 1;
            state.draft = versionOf(number, structuredClone(state.active?.designSystem ?? sampleDesignSystem()), person);
            note({ version: number, kind: 'draftStarted' });
            return undefined;
        },

        changeDraft: async (version: number, expectedRevision: number, changes: readonly DesignChange[]) => {
            record('changeDraft', version, expectedRevision, changes);
            if (refusal() !== undefined) return refusal();
            const draft = state.draft;
            if (draft === undefined || draft.number !== version) return 'There is no such draft.';
            if (draft.revision !== expectedRevision) return 'The draft changed since you loaded it. Reload and try again.';
            const designSystem = applyDesignChanges(draft.designSystem as DesignSystem, changes);
            state.draft = { ...draft, revision: draft.revision + 1, designSystem, screenplay: sampleScreenplay(designSystem) };
            if (!state.history.some(entry => entry.version === version && entry.kind === 'draftRevised' && entry.by === person)) note({ version, kind: 'draftRevised' });
            return undefined;
        },

        discardDraft: async (version: number) => {
            record('discardDraft', version);
            if (refusal() !== undefined) return refusal();
            note({ version, kind: 'draftDiscarded' });
            state.draft = undefined;
            return undefined;
        },

        activateDraft: async (version: number, expectedRevision: number) => {
            record('activateDraft', version, expectedRevision);
            if (refusal() !== undefined) return refusal();
            const draft = state.draft;
            if (draft === undefined || draft.number !== version) return 'There is no such draft.';
            if (draft.revision !== expectedRevision) return 'The draft changed since you loaded it. Reload and try again.';
            const writers = state.history.filter(entry => entry.version === version && entry.kind !== 'draftSubmittedForReview').map(entry => entry.by);
            if (writers.includes(person)) return 'Someone who did not write the draft has to activate it.';
            state.active = draft;
            state.draft = undefined;
            note({ version, kind: 'activated' });
            return undefined;
        },
    };

    if (options.review !== false) {
        host.submitDraft = async (version: number, expectedRevision: number) => {
            record('submitDraft', version, expectedRevision);
            if (refusal() !== undefined) return refusal();
            note({ version, kind: 'draftSubmittedForReview' });
            return undefined;
        };
    }

    if (options.conflicts !== undefined) {
        host.conflicts = {
            decide: async (entry: DesignSystemConflictEntry, chosen: string) => {
                record('conflicts.decide', entry.conflict.id, chosen);
                const found = state.conflicts?.find(candidate => candidate.conflict.id === entry.conflict.id);
                if (found !== undefined) { found.chosen = chosen; found.decidedBy = person; }
                return undefined;
            },
            raiseIssue: async (entry: DesignSystemConflictEntry) => {
                record('conflicts.raiseIssue', entry.conflict.id);
                const found = state.conflicts?.find(candidate => candidate.conflict.id === entry.conflict.id);
                if (found !== undefined) found.issueRaised = true;
                return undefined;
            },
        };
    }

    if (options.standard !== undefined) {
        host.standard = {
            find: async () => {
                record('standard.find');
                return structuredClone(standard);
            },
            raiseIssue: async (issue: OffStandardIssue) => {
                record('standard.raiseIssue', issue);
                return undefined;
            },
            useToken: async (entry: OffStandardEntry, replacement: string) => {
                record('standard.useToken', entry.value, replacement);
                standard = standard.map(screen => ({ ...screen, values: screen.values.filter(value => value.value !== entry.value) }));
                return undefined;
            },
            propose: async (entry: OffStandardEntry) => {
                record('standard.propose', entry.value);
                return undefined;
            },
        };
    }

    if (options.preview !== undefined) {
        const preview = options.preview;
        host.preview = {
            available: options.previewAvailable ?? true,
            draw: async () => {
                record('preview.draw');
                return structuredClone(preview);
            },
        };
    }

    if (options.draft === true && state.draft === undefined) {
        const number = Math.max(0, ...state.history.map(entry => entry.version)) + 1;
        state.draft = versionOf(number, structuredClone(state.active?.designSystem ?? sampleDesignSystem()), person);
        note({ version: number, kind: 'draftStarted' });
    }

    return host;
};
