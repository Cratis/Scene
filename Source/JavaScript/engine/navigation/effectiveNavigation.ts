// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, OutletButton, OutletItemKind, OutletKind, OutletMode, OutletNavigationItem, ToolbarEmphasis } from '@cratis/scene.model';
import { EffectiveOutletItem } from '../outlets/EffectiveOutletItem';
import { effectiveOutlet } from '../outlets/effectiveOutletResolution';
import { OutletLevelKind } from '../outlets/OutletLevelKind';
import { ApplicationStructureIndex } from '../structure';
import { EffectiveNavButton } from './EffectiveNavButton';
import { EffectiveNavigationRegion } from './EffectiveNavigationRegion';
import { EffectiveNavItem } from './EffectiveNavItem';
import { NavigationItemOrigin } from './NavigationItemOrigin';
import { NavigationSources } from './NavigationSources';
import { NavigationSourcesKind } from './NavigationSourcesKind';
import { allowsSubItems, findApplicationOutlet, modeOfModuleOutlet, navigationButtonsOutlet, navigationOutletLevels, primarySlot } from './navigationOutlets';
import { ResolvedNavigationTarget } from './ResolvedNavigationTarget';

/**
 * Resolves the items an outlet of navigation - a region such as the sidebar, or a contribution point - effectively
 * shows, for the application or for one module.
 *
 * - Application (no `module`): the application's default items, editable, `defined here`.
 * - `inherits` (the default at a module): the application items, read-only.
 * - `extends`: the application items, read-only, less the ones the module hides, followed by the module's items.
 * - `overrides`: the module's items only.
 *
 * Items contributed to the outlet (`contribute to`) follow. The outlet's buttons - its `<outlet>Buttons` outlet of
 * actions - resolve the same way, with whatever mode the module gives that outlet.
 *
 * The inheritance is resolved by {@link effectiveOutlet} over {@link navigationOutletLevels}, so navigation and every
 * other outlet share one rule and one provenance.
 *
 * Each item carries its `origin`, whether it is `readOnly`, a `reason`, and its target resolved against the
 * structure: a module target goes to the module's first feature. Sub-items belong to outlets other than the topbar; a
 * topbar is flat and its sub-items are ignored. This is the one function React renderers, Stage, Studio design mode
 * and Studio preview call; nothing re-implements it.
 *
 * The C# engine (`EffectiveNavigation.Resolve`) returns the same result; both are asserted against
 * `navigation-inheritance-fixtures.json` and `navigation-targets-fixtures.json`.
 *
 * @param structure The modules, features and slices of the application.
 * @param navigation The application's outlets and how each module refines them.
 * @param module The module to resolve for; undefined for the application.
 * @param region The name of the outlet of navigation to resolve, such as a {@link NavigationRegionKind}.
 * @returns The effective items and buttons, with where they came from.
 */
export function effectiveNavigation(
    structure: ApplicationStructure | ApplicationStructureIndex,
    navigation: NavigationModel,
    module: string | undefined,
    region: NavigationRegionKind | string,
): EffectiveNavigationRegion {
    const index = structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure);
    const name = module === undefined ? undefined : index.findModule(module)?.name ?? module;
    const levels = navigationOutletLevels(navigation, module, name);
    const reasonOf = (entry: EffectiveOutletItem): string => {
        if (name === undefined) return 'Defined here.';
        return entry.provenance.level === OutletLevelKind.Layout ? 'Inherited from the application; edit it there.' : `Defined in ${name}.`;
    };
    const originOf = (entry: EffectiveOutletItem): NavigationItemOrigin =>
        entry.provenance.level === OutletLevelKind.Layout ? NavigationItemOrigin.Application : NavigationItemOrigin.Module;
    const nested = allowsSubItems(region, findApplicationOutlet(navigation, region)?.kind ?? OutletKind.Navigation);

    const items: EffectiveNavItem[] = effectiveOutlet(levels, region).items
        .filter(entry => entry.item.kind === OutletItemKind.Navigation)
        .map(entry => resolveItem(index, nested, entry.item as OutletNavigationItem, originOf(entry), !entry.editable, reasonOf(entry)));
    const buttonsOutlet = navigationButtonsOutlet(region);
    const buttons: EffectiveNavButton[] = findApplicationOutlet(navigation, buttonsOutlet) === undefined
        ? []
        : effectiveOutlet(levels, buttonsOutlet).items
            .filter(entry => entry.item.kind === OutletItemKind.Button)
            .map(entry => resolveButton(entry.item as OutletButton, originOf(entry), !entry.editable, reasonOf(entry)));

    if (module === undefined || name === undefined) {
        return { region, sources: { kind: NavigationSourcesKind.DefinedHere, label: 'defined here' }, items, buttons };
    }

    const mode = modeOfModuleOutlet(navigation, module, region);
    switch (mode) {
        case OutletMode.Extends:
            return { region, module, mode, sources: sourcesOf(NavigationSourcesKind.Extended, name), items, buttons };
        case OutletMode.Overrides:
            return { region, module, mode, sources: sourcesOf(NavigationSourcesKind.Overridden, name), items, buttons };
        default:
            return { region, module, mode: OutletMode.Inherits, sources: sourcesOf(NavigationSourcesKind.Inherited, name), items, buttons };
    }
}

function sourcesOf(kind: NavigationSourcesKind, moduleName: string): NavigationSources {
    switch (kind) {
        case NavigationSourcesKind.Extended: return { kind, label: `Application + ${moduleName}` };
        case NavigationSourcesKind.Overridden: return { kind, label: `${moduleName} only` };
        default: return { kind: NavigationSourcesKind.Inherited, label: 'inherited' };
    }
}

function resolveButton(button: OutletButton, origin: NavigationItemOrigin, readOnly: boolean, reason: string): EffectiveNavButton {
    const resolved: EffectiveNavButton = { id: button.id, title: button.title, emphasis: button.emphasis ?? ToolbarEmphasis.Secondary, origin, readOnly, reason };
    if (button.icon !== undefined) resolved.icon = button.icon;
    if (button.slice !== undefined) resolved.slice = button.slice;
    if (button.authorize !== undefined) resolved.authorize = button.authorize;
    return resolved;
}

function resolveItem(index: ApplicationStructureIndex, nested: boolean, item: OutletNavigationItem, origin: NavigationItemOrigin, readOnly: boolean, reason: string): EffectiveNavItem {
    const resolved: EffectiveNavItem = { id: item.id, title: item.title, slot: item.slot ?? primarySlot, origin, readOnly, reason };
    if (item.icon !== undefined) resolved.icon = item.icon;
    const target = resolveTarget(index, item);
    if (target) resolved.target = target;
    if (nested && item.children && item.children.length > 0) {
        resolved.children = item.children.map(child => resolveItem(index, nested, child, origin, readOnly, reason));
    }
    return resolved;
}

function resolveTarget(index: ApplicationStructureIndex, item: OutletNavigationItem): ResolvedNavigationTarget | undefined {
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
