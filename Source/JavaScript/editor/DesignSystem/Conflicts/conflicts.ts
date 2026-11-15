// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ConflictOption, DesignSystemConflictEntry } from './DesignSystemConflict';
import type { DesignSystemConflictStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';

/**
 * Whether a conflict was decided.
 *
 * @param entry The conflict.
 * @returns True when someone chose the value to keep.
 */
export const isDecided = (entry: DesignSystemConflictEntry): boolean => entry.chosen.length > 0;

/**
 * Words for how much and where an option is used.
 *
 * @param option The option.
 * @param strings The words to use.
 * @returns For example `12 times - repo: src/index.css (7), repo: tailwind.config.js (5)`.
 */
export const usageOf = (option: ConflictOption, strings: DesignSystemConflictStrings): string => {
    const places = option.places.map(place => `${place.source} (${place.count})`).join(', ');
    const times = fill(option.count === 1 ? strings.usedOnce : strings.usedManyTimes, { count: option.count });
    return places === '' ? times : `${times} - ${places}`;
};

/**
 * How many places still use a value that was given up.
 *
 * @param entry The conflict.
 * @returns The count - what an issue for the code that should change would be about.
 */
export const placesToChange = (entry: DesignSystemConflictEntry): number =>
    isDecided(entry) ? entry.conflict.options.filter(option => option.value !== entry.chosen).reduce((total, option) => total + option.count, 0) : 0;

/**
 * What a conflict is about, for a heading.
 *
 * @param kind The kind.
 * @param strings The words to use.
 * @returns The word.
 */
export const kindLabel = (kind: DesignSystemConflictEntry['conflict']['kind'], strings: DesignSystemConflictStrings): string =>
    kind === 'color' ? strings.kindColor : strings.kindCorner;

/**
 * How many conflicts still wait for a decision.
 *
 * @param entries The conflicts of the draft.
 * @returns The count.
 */
export const undecidedCount = (entries: readonly DesignSystemConflictEntry[]): number => entries.filter(entry => !isDecided(entry)).length;
