// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItem } from '@cratis/scene.model';
import { OutletProvenance } from './OutletProvenance';

/**
 * One item of a resolved outlet, with where it comes from.
 */
export interface EffectiveOutletItem {
    /** The item. */
    item: OutletItem;

    /** Where the item comes from. */
    provenance: OutletProvenance;

    /** Whether the level the outlet is resolved for put the item there, so an editor at that level can change it. */
    editable: boolean;
}
