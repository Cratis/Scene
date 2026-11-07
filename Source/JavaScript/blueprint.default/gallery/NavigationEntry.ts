// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One entry in the gallery's navigation.
 *
 * One declaration becomes both a sidebar entry (a menu item element) and a navigation item contributed to the
 * `Navigation` outlet of navigation, so neither side has to be kept in step with the other by hand.
 */
export interface NavigationEntry {
    /** What the entry is called. */
    label: string;

    /** The screen it navigates to. */
    targetScreen: string;

    /** A PrimeIcons class for the entry's icon. */
    icon: string;

    /** The section it belongs to, so the menu and an aggregated navigation group it the same way. */
    group: string;

    /** Where it sorts within its group. */
    order: number;
}
