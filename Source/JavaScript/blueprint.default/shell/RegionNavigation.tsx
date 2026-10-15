// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind } from '@cratis/scene.model';
import { NavigationRegionClassNames, NavigationRegionView, useSceneNavigationModel } from '@cratis/scene.react';

/** The `layout-menu` vocabulary the shell's stylesheet already styles, so a region looks like the menu it replaces. */
const classNames: Partial<NavigationRegionClassNames> = {
    root: 'layout-region',
    list: 'layout-menu',
    item: 'layout-menu-item',
    link: 'layout-menu-link',
    icon: 'layout-menu-icon',
    label: 'layout-menu-label',
    toggle: 'layout-menu-toggle',
    submenu: 'layout-submenu',
};

/** Whether a navigation model is in scope, so the topbar and sidebar have a region to show. */
export function useHasRegionNavigation(): boolean {
    return useSceneNavigationModel() !== undefined;
}

/**
 * The navigation a shell's topbar or sidebar shows when the application supplies a navigation model: the effective items of
 * its region - inherit/extend/override already applied - as the shell's menu, with the active item, the hierarchy and
 * the keyboard behaviour of `NavigationRegionView`.
 */
export function RegionNavigation({ region, label }: { region: NavigationRegionKind; label?: string }) {
    return <NavigationRegionView region={region} label={label} classNames={{ ...classNames, root: `layout-region layout-region-${region}` }} />;
}
