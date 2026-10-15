// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode, NavItem } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '../structure';
import { EffectiveNavigationRegion } from './EffectiveNavigationRegion';
import { EffectiveNavItem } from './EffectiveNavItem';
import { NavigationItemOrigin } from './NavigationItemOrigin';
import { NavigationSources } from './NavigationSources';
import { NavigationSourcesKind } from './NavigationSourcesKind';
import { applicationItems, findModuleNavigation, findNavigationRegion, modeOfModuleRegion, primarySlot } from './navigationRegions';
import { ResolvedNavigationTarget } from './ResolvedNavigationTarget';

/**
 * Resolves the items a navigation region effectively shows, for the application or for one module.
 *
 * - Application (no `module`): the application items, editable, `defined here`.
 * - `inherit` (the default at a module): the application items, read-only; the module's own items are cleared.
 * - `extend`: the application items, read-only, followed by the module's items.
 * - `override`: the module's items only.
 *
 * Each item carries its `origin`, whether it is `readOnly`, a `reason`, and its target resolved against the
 * structure: a module target goes to the module's first feature. Sub-items belong to the sidebar; a topbar is flat
 * and its sub-items are ignored. This is the one function React renderers, Stage, Studio design mode and Studio
 * preview call; nothing re-implements it.
 *
 * The C# engine (`EffectiveNavigation.Resolve`) returns the same result; both are asserted against
 * `navigation-inheritance-fixtures.json` and `navigation-targets-fixtures.json`.
 *
 * @param structure The modules, features and slices of the application.
 * @param navigation The application and module regions.
 * @param module The module to resolve for; undefined for the application.
 * @param region Which region to resolve.
 */
export function effectiveNavigation(
    structure: ApplicationStructure | ApplicationStructureIndex,
    navigation: NavigationModel,
    module: string | undefined,
    region: NavigationRegionKind,
): EffectiveNavigationRegion {
    const index = structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure);
    const applicationOwned = applicationItems(navigation.application, region);

    if (module === undefined) {
        return {
            region,
            sources: { kind: NavigationSourcesKind.DefinedHere, label: 'defined here' },
            items: applicationOwned.map(item => resolveItem(index, region, item, NavigationItemOrigin.Application, false, 'Defined here.')),
        };
    }

    const mode = modeOfModuleRegion(navigation, module, region);
    const moduleOwned = findNavigationRegion(findModuleNavigation(navigation, module)?.regions, region)?.items ?? [];
    const name = index.findModule(module)?.name ?? module;
    const inherited = (): EffectiveNavItem[] => applicationOwned.map(item => resolveItem(index, region, item, NavigationItemOrigin.Application, true, 'Inherited from the application; edit it there.'));
    const own = (): EffectiveNavItem[] => moduleOwned.map(item => resolveItem(index, region, item, NavigationItemOrigin.Module, false, `Defined in ${name}.`));

    switch (mode) {
        case NavigationRegionMode.Extend:
            return { region, module, mode, sources: sourcesOf(NavigationSourcesKind.Extended, name), items: [...inherited(), ...own()] };
        case NavigationRegionMode.Override:
            return { region, module, mode, sources: sourcesOf(NavigationSourcesKind.Overridden, name), items: own() };
        default:
            return { region, module, mode: NavigationRegionMode.Inherit, sources: sourcesOf(NavigationSourcesKind.Inherited, name), items: inherited() };
    }
}

function sourcesOf(kind: NavigationSourcesKind, moduleName: string): NavigationSources {
    switch (kind) {
        case NavigationSourcesKind.Extended: return { kind, label: `Application + ${moduleName}` };
        case NavigationSourcesKind.Overridden: return { kind, label: `${moduleName} only` };
        default: return { kind: NavigationSourcesKind.Inherited, label: 'inherited' };
    }
}

function resolveItem(index: ApplicationStructureIndex, region: NavigationRegionKind, item: NavItem, origin: NavigationItemOrigin, readOnly: boolean, reason: string): EffectiveNavItem {
    const resolved: EffectiveNavItem = { id: item.id, title: item.title, slot: item.slot ?? primarySlot, origin, readOnly, reason };
    if (item.icon !== undefined) resolved.icon = item.icon;

    const target = resolveTarget(index, item);
    if (target) resolved.target = target;

    if (region === NavigationRegionKind.Sidebar && item.children && item.children.length > 0) {
        resolved.children = item.children.map(child => resolveItem(index, region, child, origin, readOnly, reason));
    }

    return resolved;
}

function resolveTarget(index: ApplicationStructureIndex, item: NavItem): ResolvedNavigationTarget | undefined {
    const module = item.target?.module;
    if (!module) return undefined;

    const target: ResolvedNavigationTarget = { module };
    const feature = item.target?.feature;
    if (feature) {
        target.feature = feature;
        if (index.findFeature(`${module}.${feature}`)) target.resolvedFeature = `${module}.${feature}`;
    } else {
        const first = index.firstFeatureId(module);
        if (first !== undefined) target.resolvedFeature = first;
    }

    return target;
}
