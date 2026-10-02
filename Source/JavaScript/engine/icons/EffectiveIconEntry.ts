// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry, IconReference } from '@cratis/scene.model';
import { ResolvedIconLibrary } from './ResolvedIconLibrary';

/**
 * An icon as a picker shows it: the catalog entry, the library that provides it (so provenance and
 * attribution are one step away), and the references that name it.
 */
export interface EffectiveIconEntry {
    /**
     * The active library that provides the icon.
     */
    library: ResolvedIconLibrary;

    /**
     * The catalog entry.
     */
    entry: IconEntry;

    /**
     * One reference per variant the icon exists in, or the single variant-less reference when it has none.
     */
    references: IconReference[];
}

/**
 * The references that name an entry of a library: one per variant, or one without a variant.
 */
export function referencesOfEntry(library: string, entry: IconEntry): IconReference[] {
    const variants = entry.variants ?? [];
    return variants.length === 0
        ? [{ library, key: entry.key }]
        : variants.map((variant) => ({ library, key: entry.key, variant }));
}
