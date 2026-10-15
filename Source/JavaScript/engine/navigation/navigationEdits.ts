// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationLogo, NavigationModel, NavigationRegion, NavigationRegionKind, NavigationRegionMode, NavItem } from '@cratis/scene.model';
import { NavigationEdit } from './NavigationEdit';
import { NavigationEditKind } from './NavigationEditKind';
import { NavigationEditOutcome } from './NavigationEditOutcome';
import { NavigationEditPlan } from './NavigationEditPlan';
import { applicationItems, collectItemIds, findModuleNavigation, findNavigationRegion, modeOfModuleRegion } from './navigationRegions';

const noMode = 'The application is the base of the navigation and has no region mode.';
const logoLevel = 'The logo is defined at the application level only.';
const flatTopbar = 'A topbar is flat; only a sidebar item has sub-items.';

/**
 * Plans a change of a module region's mode. Switching to `inherit` clears the module's items (NAV3); switching from
 * `inherit` to `override` with `copy` first copies the application's items so the module starts from them (NAV5).
 * @param navigation The navigation as it is.
 * @param module The module whose region changes; the application has no mode and is refused.
 * @param region The region.
 * @param mode The mode to switch to.
 * @param options `copy` copies the application items when switching from inherit to override.
 */
export function switchRegionMode(
    navigation: NavigationModel,
    module: string | undefined,
    region: NavigationRegionKind,
    mode: NavigationRegionMode,
    options: { copy?: boolean } = {},
): NavigationEditPlan {
    if (module === undefined) return { edits: [], rejected: noMode };

    const current = modeOfModuleRegion(navigation, module, region);
    if (current === mode) return { edits: [] };

    const setMode: NavigationEdit = { kind: NavigationEditKind.SetRegionMode, module, region, mode };
    if (mode === NavigationRegionMode.Inherit) {
        return { edits: [{ kind: NavigationEditKind.SetRegionItems, module, region, items: [] }, setMode] };
    }

    if (mode === NavigationRegionMode.Override && current === NavigationRegionMode.Inherit && options.copy === true) {
        return { edits: [{ kind: NavigationEditKind.SetRegionItems, module, region, items: structuredClone(applicationItems(navigation.application, region)) }, setMode] };
    }

    return { edits: [setMode] };
}

/**
 * Plans adding an item to a region, after the ones already there. Adding to an inheriting module region first
 * switches it to `extend` (NAV6), so the application's items stay and the new item follows them.
 * @param navigation The navigation as it is.
 * @param module The module that gets the item; undefined for the application.
 * @param region The region.
 * @param item The item to add.
 * @param parent The id of the item it becomes a sub-item of; sidebar only.
 */
export function addNavItem(
    navigation: NavigationModel,
    module: string | undefined,
    region: NavigationRegionKind,
    item: NavItem,
    parent?: string,
): NavigationEditPlan {
    if (parent !== undefined && region !== NavigationRegionKind.Sidebar) return { edits: [], rejected: flatTopbar };

    const own = ownItems(navigation, module, region);
    const ids = collectItemIds(own, region);
    if (ids.includes(item.id)) return { edits: [], rejected: `Navigation item id '${item.id}' is already used in this region.` };
    if (parent !== undefined && !ids.includes(parent)) return { edits: [], rejected: `There is no item '${parent}' to add a sub-item to.` };

    const add: NavigationEdit = { kind: NavigationEditKind.AddItem, module, region, item: structuredClone(item) };
    if (parent !== undefined) add.parent = parent;
    if (module !== undefined && modeOfModuleRegion(navigation, module, region) === NavigationRegionMode.Inherit) {
        return { edits: [{ kind: NavigationEditKind.SetRegionMode, module, region, mode: NavigationRegionMode.Extend }, add] };
    }

    return { edits: [add] };
}

/**
 * Plans setting the logo. The logo is defined at the application level only, so a module is refused.
 * @param navigation The navigation as it is.
 * @param module The module asking; only undefined (the application) is allowed.
 * @param logo The logo.
 */
export function setApplicationLogo(navigation: NavigationModel, module: string | undefined, logo: ApplicationLogo): NavigationEditPlan {
    void navigation;
    return module === undefined ? { edits: [{ kind: NavigationEditKind.SetLogo, logo: { ...logo } }] } : { edits: [], rejected: logoLevel };
}

/**
 * Applies navigation edits to a copy of the model. Either every edit applies, or none does.
 * @param navigation The navigation as it is; never changed.
 * @param edits The edits, in order.
 */
export function applyNavigationEdits(navigation: NavigationModel, edits: NavigationEdit[]): NavigationEditOutcome {
    const model = structuredClone(navigation);
    for (const edit of edits) {
        const rejected = apply(model, edit);
        if (rejected !== undefined) return { applied: false, model: navigation, rejected };
    }

    return { applied: true, model };
}

function ownItems(navigation: NavigationModel, module: string | undefined, region: NavigationRegionKind): NavItem[] {
    return module === undefined
        ? applicationItems(navigation.application, region)
        : findNavigationRegion(findModuleNavigation(navigation, module)?.regions, region)?.items ?? [];
}

function regionOf(model: NavigationModel, module: string | undefined, region: NavigationRegionKind): NavigationRegion {
    let regions: NavigationRegion[];
    if (module === undefined) {
        regions = model.application.regions;
    } else {
        let block = findModuleNavigation(model, module);
        if (!block) {
            block = { module, regions: [] };
            model.modules.push(block);
        }

        regions = block.regions;
    }

    let found = findNavigationRegion(regions, region);
    if (!found) {
        found = { region, items: [] };
        regions.push(found);
    }

    return found;
}

function apply(model: NavigationModel, edit: NavigationEdit): string | undefined {
    switch (edit.kind) {
        case NavigationEditKind.SetRegionMode:
            if (edit.module === undefined) return noMode;
            regionOf(model, edit.module, edit.region!).mode = edit.mode;
            return undefined;
        case NavigationEditKind.SetRegionItems:
            regionOf(model, edit.module, edit.region!).items = structuredClone(edit.items ?? []);
            return undefined;
        case NavigationEditKind.AddItem: {
            const target = regionOf(model, edit.module, edit.region!);
            const item = structuredClone(edit.item!);
            if (collectItemIds(target.items, target.region).includes(item.id)) return `Navigation item id '${item.id}' is already used in this region.`;
            if (edit.parent === undefined) {
                target.items.push(item);
                return undefined;
            }

            if (target.region !== NavigationRegionKind.Sidebar) return flatTopbar;
            const owner = findItem(target.items, edit.parent);
            if (!owner) return `There is no item '${edit.parent}' to add a sub-item to.`;
            (owner.children ??= []).push(item);
            return undefined;
        }
        case NavigationEditKind.SetLogo:
            if (edit.module !== undefined) return logoLevel;
            model.application.logo = { ...edit.logo! };
            return undefined;
        default:
            return `'${String((edit as NavigationEdit).kind)}' is not a navigation edit.`;
    }
}

function findItem(items: NavItem[], id: string): NavItem | undefined {
    for (const item of items) {
        if (item.id === id) return item;
        const nested = findItem(item.children ?? [], id);
        if (nested) return nested;
    }

    return undefined;
}
