// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind } from './NavigationRegionKind';
import { NavigationRegionMode } from './NavigationRegionMode';
import { NavigationButton } from './NavigationButton';
import { NavItem } from './NavItem';

/**
 * The items one level (the application or a module) defines for one navigation region.
 */
export interface NavigationRegion {
    /** Which region the items belong to. */
    region: NavigationRegionKind;

    /**
     * How a module's items relate to the application's. Absent at the application level, which is the base, and
     * meaning `inherit` at a module.
     */
    mode?: NavigationRegionMode;

    /** The items, in order. */
    items: NavItem[];

    /**
     * The application-level toolbar buttons the region declares, in order; they follow the same inherit, extend and
     * override rules as the items. Absent when the region has none.
     */
    buttons?: NavigationButton[];
}

export const NavigationRegionPropertyNames: (keyof NavigationRegion)[] = ['region', 'mode', 'items', 'buttons'];
