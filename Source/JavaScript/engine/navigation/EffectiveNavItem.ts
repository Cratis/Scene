// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationItemOrigin } from './NavigationItemOrigin';
import { ResolvedNavigationTarget } from './ResolvedNavigationTarget';

/**
 * One item a region effectively shows, with its provenance.
 */
export interface EffectiveNavItem {
    /** The item identity. */
    id: string;

    /** The text shown for the item. */
    title: string;

    /** Qualified icon reference, when the item has one. */
    icon?: string;

    /** The slot the target renders into; `content` when the item names none. */
    slot: string;

    /** What the item navigates to, with a module resolved to its first feature; absent when the item has no target. */
    target?: ResolvedNavigationTarget;

    /** Which level defined the item. */
    origin: NavigationItemOrigin;

    /** Whether the item may not be edited here: it is inherited from the application into a module. */
    readOnly: boolean;

    /** A sentence saying why the item is shown and whether it can be edited here. */
    reason: string;

    /** The sub-items; only sidebar items have them. */
    children?: EffectiveNavItem[];
}
