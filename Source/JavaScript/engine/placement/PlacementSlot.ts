// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SlotRole } from '@cratis/scene.model';

/**
 * A slot of the page an action sits on, as placement sees it: its role, whether the page's own content already fills it,
 * and whether it is routed. {@link placementSlotsOf} builds these from a layout's or template's slots.
 */
export interface PlacementSlot {
    /** The name of the slot. */
    name: string;

    /** What kind of region the slot is. */
    role: SlotRole;

    /** Whether the page's own content fills the slot, so nothing else can open in it. A routed slot is never full. */
    filled?: boolean;

    /** Whether opening something in the slot changes the URL. */
    routed?: boolean;

    /** The route parameters the routed slot is addressed by, in order. */
    routedBy?: string[];
}
