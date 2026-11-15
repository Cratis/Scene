// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useRef, useState } from 'react';
import type { DesignChange } from '../Resolving/designEdits';
import { activateDraft, discardDraft, saveChanges, startDraft, submitDraft, type DraftActionContext, type DraftOutcome } from './draftActions';

/** The actions a draft has. */
export type DraftAction = 'start' | 'change' | 'discard' | 'submit' | 'activate';

/** What the editor says about the last thing that was done. */
export interface DraftNotice {
    /** Whether it worked. */
    kind: 'success' | 'failure';

    /** What to say. */
    text: string;
}

/**
 * Starting, changing, discarding, submitting for review and activating a design system draft, with which of them is in flight
 * and what the last of them came to. One action runs at a time: asking again while one is in flight does nothing.
 *
 * @param context What the actions need to know.
 * @returns The actions and which of them are in flight.
 */
export const useDesignSystemDraft = (context: DraftActionContext) => {
    const [busy, setBusy] = useState<DraftAction | undefined>();
    const [notice, setNotice] = useState<DraftNotice | undefined>();
    const inFlight = useRef(false);
    const latest = useRef(context);
    latest.current = context;

    const run = useCallback(async (action: DraftAction, work: (current: DraftActionContext) => Promise<DraftOutcome>): Promise<DraftOutcome> => {
        if (inFlight.current) return { result: 'nothing', message: '' };
        inFlight.current = true;
        setBusy(action);
        try {
            const outcome = await work(latest.current);
            // A change a person made in a field is answered in that field; the others are answered here.
            if (outcome.result === 'refused') { if (action !== 'change') setNotice({ kind: 'failure', text: outcome.message }); }
            else if (outcome.result === 'done' && outcome.message !== '') setNotice({ kind: 'success', text: outcome.message });
            else if (outcome.result === 'done') setNotice(undefined);
            return outcome;
        } finally {
            inFlight.current = false;
            setBusy(undefined);
        }
    }, []);

    return {
        start: () => run('start', startDraft),
        /** Saves changes; answers why they were not, or nothing when they were. */
        save: async (changes: readonly DesignChange[]): Promise<string | undefined> => {
            const outcome = await run('change', current => saveChanges(current, changes));
            return outcome.result === 'refused' ? outcome.message : undefined;
        },
        discard: () => run('discard', discardDraft),
        submit: () => run('submit', submitDraft),
        activate: () => run('activate', activateDraft),
        busy,
        notice,
        dismissNotice: () => setNotice(undefined),
    };
};
