// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemHistoryEntry, DesignSystemHistoryKind } from '../DesignSystemHost';

// Asking for a review is not writing, so a submission is left out - the host holds an activator to the same list.
const draftWriteKinds: ReadonlySet<DesignSystemHistoryKind> = new Set<DesignSystemHistoryKind>([
    'draftStarted',
    'draftRevised',
    'draftRevisedByAssistant',
]);

/**
 * Who put the draft up for review, when it is waiting for one: the latest thing recorded about the version is a submission,
 * so a change since then (by hand or by an assistant) means it has to be submitted again.
 *
 * @param history The design system's history, newest first - as the host gives it.
 * @param version The draft's version.
 * @returns The name of whoever submitted it, or undefined when it is not waiting for a review.
 */
export const waitingForReview = (history: readonly DesignSystemHistoryEntry[], version: number): string | undefined => {
    const latest = history.find(entry => entry.version === version && entry.kind !== 'activated');
    return latest?.kind === 'draftSubmittedForReview' ? latest.by : undefined;
};

/**
 * The people who wrote a draft: whoever started it, changed it by hand or asked an assistant to change it. The host holds an
 * activator to the same list, so the button only looks enabled for someone it will accept.
 *
 * @param history The design system's history.
 * @param version The draft's version.
 * @returns Their names, once each.
 */
export const draftAuthors = (history: readonly DesignSystemHistoryEntry[], version: number): string[] =>
    [...new Set(history
        .filter(entry => entry.version === version && draftWriteKinds.has(entry.kind))
        .map(entry => entry.by))];

/**
 * Whether a person may activate the draft: someone other than the people who wrote it reviews and activates it.
 *
 * @param authors Who wrote the draft.
 * @param person The person asking.
 * @returns True when the person did not write it.
 */
export const mayActivate = (authors: readonly string[], person: string): boolean => person !== '' && !authors.includes(person);
