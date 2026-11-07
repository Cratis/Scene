// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItem } from '@cratis/scene.model';
import { OutletProvenance } from './OutletProvenance';
import { OutletRemoval } from './OutletRemoval';

/**
 * An inherited item a lower level hid or overrode. Editors list it struck through so it can be brought back.
 */
export interface RemovedOutletItem {
    /** The item. */
    item: OutletItem;

    /** Where the item came from. */
    provenance: OutletProvenance;

    /** Why it is not shown. */
    removal: OutletRemoval;

    /** The name of the level that hid or overrode it. */
    removedBy: string;
}
