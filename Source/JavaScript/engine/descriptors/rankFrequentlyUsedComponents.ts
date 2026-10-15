// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How often and how recently one component was added to a canvas.
 */
export interface ComponentUsage {
    /** How many times the component was added. */
    count: number;

    /** When it was last added, in milliseconds since the epoch. */
    last: number;
}

/** The number of components the "Frequently used" group lists (spec PICK3). */
export const frequentlyUsedLimit = 6;

/**
 * The components the "Frequently used" group lists: at most `limit` (6 by default), the most used first, ties broken by the most
 * recent use, and any remaining tie by the component name so the order is stable. Components never used, or whose count is not a
 * positive number, are not listed, so a picker hides the group when this is empty.
 */
export function rankFrequentlyUsedComponents(usage: Readonly<Record<string, ComponentUsage>>, limit: number = frequentlyUsedLimit): string[] {
    return Object.entries(usage)
        .filter(([, entry]) => Number.isFinite(entry.count) && entry.count > 0)
        .sort(([leftName, left], [rightName, right]) => right.count - left.count || right.last - left.last || leftName.localeCompare(rightName))
        .slice(0, Math.max(0, limit))
        .map(([name]) => name);
}
