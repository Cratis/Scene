// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemExtraSection } from '../DesignSystemHost';

/** The places within the editor that it draws itself; a host may add others by identity. */
export type BuiltInSection = 'overview' | 'color' | 'type' | 'spacing' | 'elevation' | 'themes' | 'components' | 'screenplay' | 'words' | 'standard' | 'changes';

/** A place within the editor: one of its own, or one a host added. */
export type DesignSystemSection = BuiltInSection | (string & {});

/** The groups of the navigation, in the order they are listed. */
export type SectionGroup = keyof DesignSystemEditorStrings['groups'] | 'overview';

/** One entry of the editor's navigation. */
export interface SectionEntry {
    /** The section it opens. */
    section: DesignSystemSection;

    /** What it is called. */
    label: string;

    /** The group it sits in; the overview sits in none. */
    group: string;
}

const builtIns: readonly { section: BuiltInSection; group: SectionGroup }[] = [
    { section: 'overview', group: 'overview' },
    { section: 'color', group: 'foundations' },
    { section: 'type', group: 'foundations' },
    { section: 'spacing', group: 'foundations' },
    { section: 'elevation', group: 'foundations' },
    { section: 'themes', group: 'themes' },
    { section: 'components', group: 'components' },
    { section: 'screenplay', group: 'screenplay' },
    { section: 'words', group: 'words' },
    { section: 'standard', group: 'standard' },
    { section: 'changes', group: 'draft' },
];

/**
 * The editor's navigation: the overview, foundations, themes, components, Screenplay, words, what is off the standard and - while
 * a draft is open - its changes; then the sections the host adds, grouped as it asks.
 *
 * @param strings The words to use.
 * @param hasDraft Whether a draft is open - its changes exist only then.
 * @param hasStandard Whether the host can find what is off the standard.
 * @param extra The sections the host adds.
 * @returns The entries.
 */
export const sectionEntries = (
    strings: DesignSystemEditorStrings,
    hasDraft: boolean,
    hasStandard: boolean,
    extra: readonly DesignSystemExtraSection[] = []
): SectionEntry[] => [
    ...builtIns
        .filter(entry => (entry.section !== 'changes' || hasDraft) && (entry.section !== 'standard' || hasStandard))
        .map(entry => ({ section: entry.section, label: strings.sections[entry.section], group: entry.group })),
    ...extra
        .filter(entry => !builtIns.some(own => own.section === entry.id))
        .map(entry => ({ section: entry.id, label: entry.label, group: entry.group })),
];

/**
 * Reads the section a person asked for.
 *
 * @param value What was asked for.
 * @param entries The entries on offer.
 * @returns The section, the overview when none that is on offer was asked for.
 */
export const sectionFrom = (value: string | null | undefined, entries: readonly SectionEntry[]): DesignSystemSection =>
    entries.find(entry => entry.section === value)?.section ?? 'overview';
