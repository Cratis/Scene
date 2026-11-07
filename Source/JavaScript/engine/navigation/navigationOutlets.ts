// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ModuleNavigation,
    NavigationModel,
    NavigationRegionKind,
    Outlet,
    OutletItem,
    OutletKind,
    OutletMode,
    OutletNavigationItem,
    OutletRefinement,
} from '@cratis/scene.model';
import { OutletLevel } from '../outlets/OutletLevel';
import { OutletLevelKind } from '../outlets/OutletLevelKind';

/** The name of the level the application's navigation is declared at. */
export const applicationNavigationLevel = 'Application';

/** The navigation regions in the order every result lists them; each is the name of an outlet of navigation. */
export const navigationRegionOrder: NavigationRegionKind[] = [NavigationRegionKind.Topbar, NavigationRegionKind.Sidebar];

/** The slot an item renders into when it names none: the primary slot. */
export const primarySlot = 'content';

/**
 * The name of the outlet of actions that holds a navigation outlet's buttons, such as `topbarButtons`.
 * @param outlet The name of the outlet of navigation.
 * @returns The outlet name.
 */
export function navigationButtonsOutlet(outlet: string): string {
    return `${outlet}Buttons`;
}

/**
 * The outlets the shell always offers, whether or not the application gives them default items: the `topbar` and
 * `sidebar` outlets of navigation and their `topbarButtons` and `sidebarButtons` outlets of actions.
 * @returns The outlets, without defaults.
 */
export function standardNavigationOutlets(): Outlet[] {
    return navigationRegionOrder.flatMap(region => [
        { name: region, kind: OutletKind.Navigation, defaults: [] },
        { name: navigationButtonsOutlet(region), kind: OutletKind.Actions, defaults: [] },
    ]);
}

/**
 * The outlets the application level offers: the ones it declares, followed by the standard ones it does not.
 * @param navigation The navigation model.
 * @returns The outlets.
 */
export function applicationNavigationOutlets(navigation: NavigationModel): Outlet[] {
    const declared = navigation.application.outlets ?? [];
    const names = new Set(declared.map(outlet => outlet.name));
    return [...declared, ...standardNavigationOutlets().filter(outlet => !names.has(outlet.name))];
}

/**
 * Finds an outlet the application level offers, declared or standard.
 * @param navigation The navigation model.
 * @param outlet The outlet name.
 * @returns The outlet, or undefined when the application offers none of that name.
 */
export function findApplicationOutlet(navigation: NavigationModel, outlet: string): Outlet | undefined {
    return applicationNavigationOutlets(navigation).find(candidate => candidate.name === outlet);
}

/**
 * Finds what a module declares.
 * @param navigation The navigation model.
 * @param module The module identity.
 * @returns The module's navigation, or undefined when it declares nothing.
 */
export function findModuleNavigation(navigation: NavigationModel, module: string): ModuleNavigation | undefined {
    return navigation.modules.find(candidate => candidate.module === module);
}

/**
 * Finds how a module refines an outlet.
 * @param navigation The navigation model.
 * @param module The module identity.
 * @param outlet The outlet name.
 * @returns The refinement, or undefined when the module does not refine the outlet.
 */
export function findModuleRefinement(navigation: NavigationModel, module: string, outlet: string): OutletRefinement | undefined {
    return findModuleNavigation(navigation, module)?.refinements?.find(refinement => refinement.outlet === outlet);
}

/**
 * The mode a refinement resolves with: the one it states, or `extends` when it adds or hides items and `inherits` when
 * it does neither - the rule outlet resolution applies.
 * @param refinement The refinement, or undefined for none.
 * @returns The mode.
 */
export function modeOfRefinement(refinement: OutletRefinement | undefined): OutletMode {
    if (refinement === undefined) return OutletMode.Inherits;
    return refinement.mode ?? ((refinement.items?.length ?? 0) > 0 || (refinement.hide?.length ?? 0) > 0 ? OutletMode.Extends : OutletMode.Inherits);
}

/**
 * How a module treats an outlet it inherits from the application: `inherits` when it does not refine it.
 * @param navigation The navigation model.
 * @param module The module identity.
 * @param outlet The outlet name.
 * @returns The mode.
 */
export function modeOfModuleOutlet(navigation: NavigationModel, module: string, outlet: string): OutletMode {
    return modeOfRefinement(findModuleRefinement(navigation, module, outlet));
}

/**
 * The items a level puts in an outlet itself: the application's defaults, or a module's refinement items.
 * @param navigation The navigation model.
 * @param module The module; undefined for the application.
 * @param outlet The outlet name.
 * @returns The items, in order.
 */
export function ownOutletItems(navigation: NavigationModel, module: string | undefined, outlet: string): OutletItem[] {
    return module === undefined
        ? findApplicationOutlet(navigation, outlet)?.defaults ?? []
        : findModuleRefinement(navigation, module, outlet)?.items ?? [];
}

/**
 * Whether items of an outlet may have sub-items: only items of an outlet of navigation other than the flat topbar.
 * @param outlet The outlet name.
 * @param kind What the outlet lists.
 * @returns Whether sub-items are allowed.
 */
export function allowsSubItems(outlet: string, kind: OutletKind | undefined): boolean {
    return kind === OutletKind.Navigation && outlet !== NavigationRegionKind.Topbar;
}

/**
 * Every id in a list of items, depth first. Sub-items count only where the outlet allows them.
 * @param items The items.
 * @param nested Whether sub-items count.
 * @returns The ids.
 */
export function collectItemIds(items: OutletItem[], nested: boolean): string[] {
    return items.flatMap(item => [item.id, ...(nested ? collectItemIds(childrenOf(item), nested) : [])]);
}

/**
 * The sub-items of an item: a navigation item's children; nothing for any other item.
 * @param item The item.
 * @returns The sub-items.
 */
export function childrenOf(item: OutletItem): OutletNavigationItem[] {
    return 'children' in item && Array.isArray(item.children) ? item.children : [];
}

/**
 * The chain of outlet levels a navigation model is: the application level declares the outlets of its shell layout (and
 * the standard ones it does not declare), and a module refines them and contributes to them.
 * @param navigation The navigation model.
 * @param module The module to resolve for; undefined for the application.
 * @param moduleName The name editors show for the module; the module id when absent.
 * @returns The levels, from the top down.
 */
export function navigationOutletLevels(navigation: NavigationModel, module?: string, moduleName?: string): OutletLevel[] {
    const application: OutletLevel = {
        kind: OutletLevelKind.Layout,
        name: applicationNavigationLevel,
        outlets: applicationNavigationOutlets(navigation),
    };
    if (module === undefined) return [application];

    const declared = findModuleNavigation(navigation, module);
    const level: OutletLevel = { kind: OutletLevelKind.Module, name: moduleName ?? module };
    if (declared?.refinements !== undefined) level.refinements = declared.refinements;
    if (declared?.contributions !== undefined) level.contributions = declared.contributions;
    return [application, level];
}
