// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '../common';

/**
 * One item of a navigation region.
 */
export interface NavItem {
    /** The item identity, unique in its region at the level that owns it. */
    id: string;

    /** The text shown for the item. */
    title: string;

    /** Qualified icon reference, when the item has one. */
    icon?: string;

    /**
     * What the item navigates to: `module`, and optionally `feature` (a dotted path inside the module). A module
     * without a feature goes to the module's first feature.
     */
    target?: DestinationReference;

    /** The rendering slot - an outlet id - the target renders into; `content`, the primary outlet, when absent. */
    slot?: string;

    /** The sub-items; only a sidebar item has them. */
    children?: NavItem[];
}

export const NavItemPropertyNames: (keyof NavItem)[] = ['id', 'title', 'icon', 'target', 'slot', 'children'];
