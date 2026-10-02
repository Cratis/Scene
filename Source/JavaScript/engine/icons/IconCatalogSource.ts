// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry } from '@cratis/scene.model';

/**
 * Where one icon library's catalog comes from. The library's module provides it; the engine only asks
 * for it when something needs the library's icons, so resolving a profile never loads a catalog.
 *
 * A source supplies metadata only. The artwork for each icon is loaded separately, per icon, by the
 * renderer's adapter for the library.
 */
export interface IconCatalogSource {
    /**
     * The library the catalog belongs to.
     */
    library: string;

    /**
     * Loads the library's icon entries. Called at most once per successful load.
     */
    loadEntries(): Promise<IconEntry[]>;
}
