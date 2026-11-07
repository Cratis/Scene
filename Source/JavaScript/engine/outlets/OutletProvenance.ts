// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemSource } from './OutletItemSource';
import { OutletLevelKind } from './OutletLevelKind';

/**
 * Where an item of a resolved outlet comes from.
 */
export interface OutletProvenance {
    /** The name of the level that put the item there, such as `Catalog`. */
    owner: string;

    /** Where in the chain that level sits. */
    level: OutletLevelKind;

    /** How the item came in. */
    source: OutletItemSource;
}
