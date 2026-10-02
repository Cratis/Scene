// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry } from '@cratis/scene.model';
import { IconQuery } from './IconQuery';

/**
 * Whether a catalog entry satisfies the entry-level parts of a query - text, category and variant. The
 * library part is decided earlier, because it decides which catalogs get loaded at all.
 */
export function matchesIconQuery(entry: IconEntry, query: IconQuery): boolean {
    if (query.category !== undefined && !entry.categories.includes(query.category)) return false;
    if (query.variant !== undefined && !(entry.variants ?? []).includes(query.variant)) return false;

    const text = query.text?.trim().toLowerCase();
    if (!text) return true;

    return [entry.name, entry.key, ...(entry.aliases ?? []), ...(entry.tags ?? [])].some((term) => term.toLowerCase().includes(text));
}
