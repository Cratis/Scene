// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveIconEntry } from './EffectiveIconEntry';
import { IconDiagnostic } from './IconDiagnostic';

/**
 * The outcome of querying the effective catalog.
 */
export interface IconSearchResult {
    /**
     * The icons that matched, library by library in resolution order and in each catalog's own order.
     */
    entries: EffectiveIconEntry[];

    /**
     * Libraries whose catalog could not be loaded and so contributed nothing - reported rather than
     * dropped, so an absent icon is never mistaken for one that does not exist.
     */
    diagnostics: IconDiagnostic[];
}
