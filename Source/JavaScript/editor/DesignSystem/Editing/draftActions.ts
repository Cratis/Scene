// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemConfirmation, DesignSystemHost, DesignSystemRefusal, DesignSystemVersion } from '../DesignSystemHost';
import { fill } from '../fill';
import type { DesignChange } from '../Resolving/designEdits';
import { startDraftPrompt } from './startDraftPrompt';

/** What one of the draft's actions came to. */
export interface DraftOutcome {
    /** Whether it was done, the host refused it, or the person answered no to the question. */
    result: 'done' | 'refused' | 'declined' | 'nothing';

    /** What to say: the note of what was done, or the reason it was refused. Empty for the other results. */
    message: string;
}

/** What the actions on a draft need to know. */
export interface DraftActionContext {
    /** The host the actions go to. */
    host: DesignSystemHost;

    /** The editor's words. */
    strings: DesignSystemEditorStrings;

    /** The open draft, when there is one. */
    draft?: DesignSystemVersion;

    /** Whether the design system has an active version the draft would start from. */
    hasActive: boolean;

    /** Asks the person a question and answers whether they said yes. */
    ask: (confirmation: DesignSystemConfirmation) => Promise<boolean>;

    /** Reads the design system again, so the next change is made against what was just saved. */
    reload: () => Promise<void>;
}

const done = (message: string): DraftOutcome => ({ result: 'done', message });
const refused = (message: string): DraftOutcome => ({ result: 'refused', message });
const declined: DraftOutcome = { result: 'declined', message: '' };
const nothing: DraftOutcome = { result: 'nothing', message: '' };

// A host that throws has not answered; that is a refusal the person can read, not a crash of the editor.
const attempt = async (call: () => Promise<DesignSystemRefusal>, failed: string): Promise<DesignSystemRefusal> => {
    try {
        return await call();
    } catch {
        return failed;
    }
};

/**
 * Starts a draft once the person has said they mean it.
 *
 * @param context What the actions need to know.
 * @returns What came of it.
 */
export const startDraft = async (context: DraftActionContext): Promise<DraftOutcome> => {
    if (!await context.ask(startDraftPrompt(context.hasActive, context.strings.prompts))) return declined;
    const refusal = await attempt(() => context.host.startDraft(), context.strings.outcomes.failed);
    if (refusal !== undefined) return refused(refusal);
    await context.reload();
    return done(context.strings.outcomes.started);
};

/**
 * Makes changes to the draft, together, against the revision the person loaded, and reads the design system again either way:
 * the next change is checked against what the draft is now.
 *
 * @param context What the actions need to know.
 * @param changes The changes.
 * @returns What came of it. Refused with nothing to say when there is no draft.
 */
export const saveChanges = async (context: DraftActionContext, changes: readonly DesignChange[]): Promise<DraftOutcome> => {
    const { draft } = context;
    if (draft === undefined || changes.length === 0) return nothing;
    const refusal = await attempt(() => context.host.changeDraft(draft.number, draft.revision, changes), context.strings.outcomes.saveFailed);
    await context.reload();
    return refusal === undefined ? done('') : refused(refusal === '' ? context.strings.outcomes.saveFailed : refusal);
};

/**
 * Throws the draft away once the person has said they mean it.
 *
 * @param context What the actions need to know.
 * @returns What came of it.
 */
export const discardDraft = async (context: DraftActionContext): Promise<DraftOutcome> => {
    const { draft, strings } = context;
    if (draft === undefined) return nothing;
    const values = { version: draft.number };
    if (!await context.ask({ title: fill(strings.prompts.discard.title, values), message: strings.prompts.discard.message })) return declined;
    const refusal = await attempt(() => context.host.discardDraft(draft.number), strings.outcomes.failed);
    if (refusal !== undefined) return refused(refusal);
    await context.reload();
    return done(fill(strings.outcomes.discarded, values));
};

/**
 * Puts the draft up for review.
 *
 * @param context What the actions need to know.
 * @returns What came of it. Nothing when there is no draft or the host has no review step.
 */
export const submitDraft = async (context: DraftActionContext): Promise<DraftOutcome> => {
    const { draft, strings, host } = context;
    if (draft === undefined || host.submitDraft === undefined) return nothing;
    const submit = host.submitDraft;
    const refusal = await attempt(() => submit.call(host, draft.number, draft.revision), strings.outcomes.failed);
    if (refusal !== undefined) return refused(refusal);
    await context.reload();
    return done(fill(strings.outcomes.submitted, { version: draft.number }));
};

/**
 * Makes the draft the design system once the person has said they mean it.
 *
 * @param context What the actions need to know.
 * @returns What came of it.
 */
export const activateDraft = async (context: DraftActionContext): Promise<DraftOutcome> => {
    const { draft, strings } = context;
    if (draft === undefined) return nothing;
    const values = { version: draft.number };
    if (!await context.ask({ title: fill(strings.prompts.activate.title, values), message: strings.prompts.activate.message })) return declined;
    const refusal = await attempt(() => context.host.activateDraft(draft.number, draft.revision), strings.outcomes.failed);
    if (refusal !== undefined) return refused(refusal);
    await context.reload();
    return done(fill(strings.outcomes.activated, values));
};
