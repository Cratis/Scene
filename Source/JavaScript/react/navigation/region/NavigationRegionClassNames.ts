// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.


/**
 * The class names a {@link NavigationRegionView} puts on its nodes. The renderer carries no look of its own: a package
 * gives the nodes its vocabulary (`blueprint.default` uses its `layout-menu` classes) and a stylesheet does the rest.
 * State is always on data attributes as well - `data-active`, `data-expanded`, `data-read-only`, `data-origin`.
 */
export interface NavigationRegionClassNames {
    /** The `nav` landmark. */
    root: string;

    /** Each list of items. */
    list: string;

    /** Each item's `li`. */
    item: string;

    /** The link of an item. */
    link: string;

    /** The icon of an item. */
    icon: string;

    /** The title of an item. */
    label: string;

    /** The button that expands or collapses an item's sub-items. */
    toggle: string;

    /** The list of an item's sub-items. */
    submenu: string;

    /** The group of application-level toolbar buttons the region declares. */
    buttons: string;

    /** One application-level toolbar button; it also carries `scene-toolbar-button-<emphasis>` as the screen toolbar's buttons do. */
    button: string;
}

/** The class names used when a host passes none. */
export const defaultNavigationRegionClassNames: NavigationRegionClassNames = {
    root: 'scene-nav',
    list: 'scene-nav-list',
    item: 'scene-nav-item',
    link: 'scene-nav-link',
    icon: 'scene-nav-icon',
    label: 'scene-nav-label',
    toggle: 'scene-nav-toggle',
    submenu: 'scene-nav-submenu',
    buttons: 'scene-nav-buttons',
    button: 'scene-nav-button',
};
