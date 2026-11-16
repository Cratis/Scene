// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemStandardStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';

/** What kind of thing is outside the design system. */
export type OffStandardKind = 'color' | 'token' | 'component';

/** One value, token or component a screen uses that the design system does not hold. */
export interface OffStandardValue {
    /** What kind of thing it is. */
    kind: OffStandardKind;

    /** What was found. */
    value: string;

    /** The token or class to use instead - empty when there is none to suggest. */
    suggestion: string;

    /** How many times the screen uses it. */
    count: number;
}

/** What a screen has outside the design system: what the host's check of the current version of a screen found. */
export interface OffStandardScreen {
    /** The screen's identity, as the host knows it - handed back when the host is asked to change the screen. */
    id: string;

    /** What the screen is called. */
    title: string;

    /** What the screen has outside the design system. */
    values: readonly OffStandardValue[];
}

/** Where a value that is outside the design system is used. */
export interface OffStandardPlace {
    /** The screen's identity. */
    screen: string;

    /** What the screen is called. */
    title: string;

    /** How many times the screen uses it. */
    count: number;
}

/** One value, token or component that is outside the design system, with every screen that uses it. */
export interface OffStandardEntry {
    /** What kind of thing it is. */
    kind: OffStandardKind;

    /** What was found. */
    value: string;

    /** The token or class to use instead - empty when there is none to suggest. */
    suggestion: string;

    /** The screens that use it. */
    places: OffStandardPlace[];

    /** How many times it is used in all. */
    total: number;
}

/** An issue for the code that should keep to the design system: what the host is asked to raise. */
export interface OffStandardIssue {
    /** The issue's title. */
    title: string;

    /** One line for each value, saying what it is, where, and what to use instead. */
    findings: string[];

    /** The entries the issue is about. */
    entries: readonly OffStandardEntry[];
}

/**
 * Gathers what the current version of every screen has outside the design system.
 *
 * @param screens What the host found on each screen.
 * @returns One entry for each value, the most used first.
 */
export const offStandardEntries = (screens: readonly OffStandardScreen[]): OffStandardEntry[] => {
    const entries = new Map<string, OffStandardEntry>();
    for (const screen of screens) {
        for (const item of screen.values) {
            const key = `${item.kind}:${item.value}`;
            const entry = entries.get(key) ?? { kind: item.kind, value: item.value, suggestion: item.suggestion, places: [], total: 0 };
            entry.places.push({ screen: screen.id, title: screen.title, count: item.count });
            entry.total += item.count;
            entries.set(key, entry);
        }
    }

    return [...entries.values()].sort((first, second) => second.total - first.total || first.value.localeCompare(second.value));
};

/**
 * The entry for one value on one screen - what the screen's own check proposes to the design system.
 *
 * @param screen The screen.
 * @param item What the check found on it.
 * @returns The entry, with the screen as its one place.
 */
export const offStandardEntryOf = (screen: Pick<OffStandardScreen, 'id' | 'title'>, item: OffStandardValue): OffStandardEntry => ({
    kind: item.kind,
    value: item.value,
    suggestion: item.suggestion,
    places: [{ screen: screen.id, title: screen.title, count: item.count }],
    total: item.count,
});

/**
 * Words for one entry, for an issue.
 *
 * @param entry The entry.
 * @returns A line saying what it is, where, and what to use instead.
 */
export const issueLine = (entry: OffStandardEntry): string => {
    const where = entry.places.map(place => place.title).join(', ');
    return `${entry.kind} \`${entry.value}\` (${entry.total} times) in ${where}${entry.suggestion ? `; use \`${entry.suggestion}\`` : ''}`;
};

/**
 * The issue for bringing some values back to the design system.
 *
 * @param entries The entries.
 * @param strings The words to use.
 * @returns The issue, titled for how many values it is about.
 */
export const issueFor = (entries: readonly OffStandardEntry[], strings: DesignSystemStandardStrings): OffStandardIssue => ({
    title: entries.length === 1
        ? fill(strings.issueTitleOne, { value: entries[0].value })
        : fill(strings.issueTitleMany, { count: entries.length }),
    findings: entries.map(issueLine),
    entries,
});

/**
 * What to ask for when a value should become part of the design system.
 *
 * @param entry The entry.
 * @returns The request.
 */
export const proposalBrief = (entry: OffStandardEntry): string =>
    `Designs use the ${entry.kind} ${entry.value} ${entry.total} times, in ${entry.places.map(place => place.title).join(', ')}, and the design system has no such ${entry.kind}. Add it to the design system - give it a meaningful name and, if it is a color, a dark mode value - or tell me why it should not be added.`;

/**
 * The token to write in place of an off-standard value, as a CSS reference.
 *
 * @param suggestion The token or class the check suggested.
 * @returns The reference (`var(--token)`), or the suggestion as it is when it already is one.
 */
export const replacementFor = (suggestion: string): string => suggestion.startsWith('var(') ? suggestion : `var(${suggestion})`;
