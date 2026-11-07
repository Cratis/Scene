// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What an {@link Outlet} lists. Every kind shares the same inheritance (`inherits | extends | overrides`, `hide`,
 * `before | after`) and contributions; only the items differ.
 */
export enum OutletKind {
    /** Buttons, menu entries, separators and groups that run a slice, navigate or run a built-in. */
    Actions = 'actions',

    /** Filters that set a parameter of the query the screen shows. */
    Filters = 'filters',

    /** Tabs, each showing a screen in the slot the outlet owns. */
    Tabs = 'tabs',

    /** Stats, each showing a field of a single-result query. */
    Stats = 'stats',

    /** Navigation items that open a module, a feature or a screen. */
    Navigation = 'navigation',
}
