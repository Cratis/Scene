// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    NavigationButton,
    NavigationItem,
    NavigationModel,
    NavigationRegionKind,
    NavigationRegionMode,
    NavItem,
    OutletButton,
    OutletContribution,
    OutletItemKind,
    OutletKind,
    OutletMode,
    OutletNavigationItem,
} from '@cratis/scene.model';
import { OutletLevel } from '../outlets/OutletLevel';
import { OutletLevelKind } from '../outlets/OutletLevelKind';
import { findModuleNavigation, findNavigationRegion, navigationRegionOrder } from './navigationRegions';

/** The name of the level the application's navigation is declared at. */
export const applicationNavigationLevel = 'Application';

/**
 * The name of the outlet of actions that holds a navigation region's buttons, such as `topbarButtons`.
 * @param region The region.
 * @returns The outlet name.
 */
export function navigationButtonsOutlet(region: NavigationRegionKind): string {
    return `${region}Buttons`;
}

const modes: Record<NavigationRegionMode, OutletMode> = {
    [NavigationRegionMode.Inherit]: OutletMode.Inherits,
    [NavigationRegionMode.Extend]: OutletMode.Extends,
    [NavigationRegionMode.Override]: OutletMode.Overrides,
};

/**
 * Turns an item of a navigation region into the item of the outlet of navigation the region is.
 * @param item The region item.
 * @returns The outlet item.
 */
export function navItemAsOutletItem(item: NavItem): OutletNavigationItem {
    const result: OutletNavigationItem = { kind: OutletItemKind.Navigation, id: item.id, title: item.title };
    if (item.icon !== undefined) result.icon = item.icon;
    if (item.target !== undefined) result.target = item.target;
    if (item.slot !== undefined) result.slot = item.slot;
    if (item.children !== undefined) result.children = item.children.map(navItemAsOutletItem);
    return result;
}

/**
 * Turns an item of an outlet of navigation back into a navigation region item.
 * @param item The outlet item.
 * @returns The region item.
 */
export function outletItemAsNavItem(item: OutletNavigationItem): NavItem {
    const result: NavItem = { id: item.id, title: item.title };
    if (item.icon !== undefined) result.icon = item.icon;
    if (item.target !== undefined) result.target = item.target;
    if (item.slot !== undefined) result.slot = item.slot;
    if (item.children !== undefined) result.children = item.children.map(outletItemAsNavItem);
    return result;
}

/**
 * Turns a button of a navigation region into a button of an outlet of actions.
 * @param button The region button.
 * @returns The outlet button.
 */
export function navigationButtonAsOutletButton(button: NavigationButton): OutletButton {
    const result: OutletButton = { kind: OutletItemKind.Button, id: button.id, title: button.title };
    if (button.icon !== undefined) result.icon = button.icon;
    if (button.slice !== undefined) result.slice = button.slice;
    if (button.emphasis !== undefined) result.emphasis = button.emphasis;
    if (button.authorize !== undefined) result.authorize = button.authorize;
    return result;
}

/**
 * The chain of outlet levels a navigation model is: the application declares an outlet of navigation per region (and an
 * outlet of actions for the region's buttons), and a module refines them with the region's mode. Navigation regions are
 * outlets of navigation; this is the one place that says how.
 * @param navigation The navigation model.
 * @param module The module to resolve for; undefined for the application.
 * @param moduleName The name editors show for the module; the module id when absent.
 * @returns The levels, from the top down.
 */
export function navigationOutletLevels(navigation: NavigationModel, module?: string, moduleName?: string): OutletLevel[] {
    const application: OutletLevel = {
        kind: OutletLevelKind.Layout,
        name: applicationNavigationLevel,
        outlets: navigationRegionOrder.flatMap(region => {
            const declared = findNavigationRegion(navigation.application.regions, region);
            return [
                { name: region, kind: OutletKind.Navigation, defaults: (declared?.items ?? []).map(navItemAsOutletItem) },
                { name: navigationButtonsOutlet(region), kind: OutletKind.Actions, defaults: (declared?.buttons ?? []).map(navigationButtonAsOutletButton) },
            ];
        }),
    };
    if (module === undefined) return [application];

    const regions = findModuleNavigation(navigation, module)?.regions ?? [];
    return [application, {
        kind: OutletLevelKind.Module,
        name: moduleName ?? module,
        refinements: regions.flatMap(region => {
            const mode = modes[region.mode ?? NavigationRegionMode.Inherit] ?? OutletMode.Inherits;
            const own = mode === OutletMode.Inherits ? undefined : region.items.map(navItemAsOutletItem);
            const buttons = mode === OutletMode.Inherits ? undefined : (region.buttons ?? []).map(navigationButtonAsOutletButton);
            return [
                { outlet: region.region, mode, ...(own ? { items: own } : {}) },
                { outlet: navigationButtonsOutlet(region.region), mode, ...(buttons ? { items: buttons } : {}) },
            ];
        }),
    }];
}

/**
 * Turns the items a screen contributes to a navigation contribution point into a contribution to the outlet of
 * navigation of that name. Items keep their declared `order`; items without one follow in the order given.
 * @param outlet The name of the outlet of navigation - the contribution point's name.
 * @param items The contributed navigation items.
 * @returns The contribution.
 */
export function navigationItemsAsOutletContribution(outlet: string, items: NavigationItem[]): OutletContribution {
    const ordered = items
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
            if (a.item.order === undefined && b.item.order === undefined) return a.index - b.index;
            if (a.item.order === undefined) return 1;
            if (b.item.order === undefined) return -1;
            return a.item.order - b.item.order || a.index - b.index;
        })
        .map(({ item }) => {
            const result: OutletNavigationItem = {
                kind: OutletItemKind.Navigation,
                id: item.id ?? item.targetScreen,
                title: item.label,
                target: item.destination ?? { screen: item.targetScreen },
            };
            if (item.icon !== undefined) result.icon = item.icon;
            return result;
        });
    return { outlet, items: ordered };
}
