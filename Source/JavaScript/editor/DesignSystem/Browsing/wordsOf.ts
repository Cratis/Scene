// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystem } from '@cratis/scene.model';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';

/** The groups the words of a design system are kept in. */
export type WordsGroup = 'voice' | 'naming';

/** One word of a design system. */
export interface DesignWord {
    /** The word's key. */
    key: string;

    /** What it says. */
    text: string;
}

/** The words of one group. */
export interface WordsOfGroup {
    /** The group. */
    kind: WordsGroup;

    /** What the group is called. */
    title: string;

    /** What the group is for. */
    description: string;

    /** The words in it, in the order the design system lists them. */
    words: readonly DesignWord[];
}

const wordsIn = (record: Readonly<Record<string, string>> | undefined): DesignWord[] =>
    Object.entries(record ?? {}).map(([key, text]) => ({ key, text }));

/**
 * The voice and naming of a design system.
 *
 * @param design The design system of the version shown.
 * @param strings The words to use.
 * @returns The two groups, with what each holds.
 */
export const wordsOf = (design: DesignSystem, strings: DesignSystemEditorStrings['words']): WordsOfGroup[] => [
    { kind: 'voice', title: strings.voiceTitle, description: strings.voiceDescription, words: wordsIn(design.words?.voice) },
    { kind: 'naming', title: strings.namingTitle, description: strings.namingDescription, words: wordsIn(design.words?.naming) },
];
