// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationNavigation, ModuleNavigation, NavigationModel, NavigationRegion, NavigationRegionKind, NavigationRegionMode, NavItem } from '@cratis/scene.model';

/** The regions in the order every result lists them. */
export const navigationRegionOrder: NavigationRegionKind[] = [NavigationRegionKind.Topbar, NavigationRegionKind.Sidebar];

/** The slot an item renders into when it names none: the primary outlet. */
export const primarySlot = 'content';

/**
 * Finds the items a level defines for a region.
 * @param regions The regions of the application or of a module.
 * @param region The region to look for.
 */
export function findNavigationRegion(regions: NavigationRegion[] | undefined, region: NavigationRegionKind): NavigationRegion | undefined {
    return regions?.find(candidate => candidate.region === region);
}

/** Finds what a module declares; undefined when it declares nothing. */
export function findModuleNavigation(navigation: NavigationModel, module: string): ModuleNavigation | undefined {
    return navigation.modules.find(candidate => candidate.module === module);
}

/** The mode of a module's region: `inherit` when the module does not declare the region or its mode. */
export function modeOfModuleRegion(navigation: NavigationModel, module: string, region: NavigationRegionKind): NavigationRegionMode {
    return findNavigationRegion(findModuleNavigation(navigation, module)?.regions, region)?.mode ?? NavigationRegionMode.Inherit;
}

/** The application-level items of a region. */
export function applicationItems(application: ApplicationNavigation, region: NavigationRegionKind): NavItem[] {
    return findNavigationRegion(application.regions, region)?.items ?? [];
}

/** Every id in a list of items, depth first. Sub-items count only in the sidebar. */
export function collectItemIds(items: NavItem[], region: NavigationRegionKind): string[] {
    return items.flatMap(item => [item.id, ...(region === NavigationRegionKind.Sidebar ? collectItemIds(item.children ?? [], region) : [])]);
}
