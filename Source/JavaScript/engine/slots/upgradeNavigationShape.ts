// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

type JsonObject = { [key: string]: unknown };

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const legacyModes: Record<string, string> = { inherit: 'inherits', extend: 'extends', override: 'overrides' };

function textOf(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function numberOf(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
}

/**
 * Tells whether a value is a list of navigation regions in the shape Scene 5 replaced with outlets of navigation: every
 * entry names its `region` and lists its `items`.
 * @param value The value of a level's `regions` key.
 * @returns Whether it is a legacy region list.
 */
export function isLegacyRegionList(value: unknown): value is JsonObject[] {
    return Array.isArray(value) && value.every(region => isObject(region) && typeof region.region === 'string' && Array.isArray(region.items));
}

/**
 * Tells whether a value is a navigation model in the shape Scene 5 replaced with outlets: the application and its
 * modules list navigation regions.
 * @param value The value.
 * @returns Whether it is a legacy navigation model.
 */
export function isLegacyNavigationModel(value: unknown): value is JsonObject {
    return isObject(value)
        && isObject(value.application)
        && isLegacyRegionList(value.application.regions)
        && Array.isArray(value.modules)
        && value.modules.every(module => isObject(module) && (module.regions === undefined || isLegacyRegionList(module.regions)));
}

function navigationItem(item: JsonObject): JsonObject {
    const result: JsonObject = { kind: 'navigation', id: item.id, title: item.title };
    if (item.icon !== undefined) result.icon = item.icon;
    if (item.target !== undefined) result.target = item.target;
    if (item.slot !== undefined) result.slot = item.slot;
    if (Array.isArray(item.children)) result.children = item.children.filter(isObject).map(navigationItem);
    return result;
}

function button(item: JsonObject): JsonObject {
    const result: JsonObject = { kind: 'button', id: item.id, title: item.title };
    if (item.icon !== undefined) result.icon = item.icon;
    if (item.slice !== undefined) result.slice = item.slice;
    if (item.emphasis !== undefined) result.emphasis = item.emphasis;
    if (item.authorize !== undefined) result.authorize = item.authorize;
    return result;
}

function itemsOf(region: JsonObject, key: 'items' | 'buttons'): JsonObject[] {
    return Array.isArray(region[key]) ? (region[key] as unknown[]).filter(isObject) : [];
}

/**
 * Upgrades a navigation model from regions to outlets, in place.
 *
 * - Each application region becomes an outlet of navigation named after the region, its items the outlet's default
 *   navigation items; its buttons, when it has any, become the `<region>Buttons` outlet of actions.
 * - Each module region that extends or overrides becomes a refinement of that outlet with the same mode (`extend`
 *   becomes `extends`, `override` becomes `overrides`) and its items. A region that inherits says nothing and is
 *   dropped: an outlet a module does not refine is inherited.
 * - A module region's buttons refine the `<region>Buttons` outlet with the region's mode. A region that overrides
 *   overrides the application's buttons too, as it did, so it hides them even when it has none of its own.
 * @param navigation The legacy navigation model.
 */
export function upgradeNavigationModel(navigation: JsonObject): void {
    const application = navigation.application as JsonObject;
    const buttonRegions = new Set<string>();
    navigation.application = upgradeApplication(application, buttonRegions);

    navigation.modules = (navigation.modules as JsonObject[]).map(module =>
        Array.isArray(module.regions) ? upgradeModule(module, module.regions as JsonObject[], buttonRegions) : module);
}

function upgradeApplication(application: JsonObject, buttonRegions: Set<string>): JsonObject {
    const outlets: JsonObject[] = [];
    for (const region of application.regions as JsonObject[]) outlets.push(...outletsOf(region, buttonRegions));

    const upgraded: JsonObject = { outlets };
    for (const [key, value] of Object.entries(application)) {
        if (key !== 'regions') upgraded[key] = value;
    }
    return upgraded;
}

function outletsOf(region: JsonObject, buttonRegions: Set<string>): JsonObject[] {
    const name = region.region as string;
    const outlets: JsonObject[] = [{ name, kind: 'navigation', defaults: itemsOf(region, 'items').map(navigationItem) }];
    const buttons = itemsOf(region, 'buttons');
    if (buttons.length > 0) {
        buttonRegions.add(name);
        outlets.push({ name: `${name}Buttons`, kind: 'actions', defaults: buttons.map(button) });
    }
    return outlets;
}

function upgradeModule(module: JsonObject, regions: JsonObject[], buttonRegions: Set<string>): JsonObject {
    const refinements = refinementsOf(regions, buttonRegions);
    const result: JsonObject = {};
    for (const [key, value] of Object.entries(module)) {
        if (key !== 'regions') result[key] = value;
        else if (refinements.length > 0) result.refinements = refinements;
    }
    return result;
}

function refinesButtons(buttons: JsonObject[], replacesApplicationButtons: boolean): boolean {
    return buttons.length > 0 || replacesApplicationButtons;
}

function refinementsOf(regions: JsonObject[], buttonRegions: Set<string>): JsonObject[] {
    const refinements: JsonObject[] = [];
    for (const region of regions) {
        const name = region.region as string;
        const mode = legacyModes[textOf(region.mode) ?? 'inherit'] ?? 'inherits';
        if (mode === 'inherits') continue;
        refinements.push({ outlet: name, mode, items: itemsOf(region, 'items').map(navigationItem) });
        const buttons = itemsOf(region, 'buttons');
        if (refinesButtons(buttons, mode === 'overrides' && buttonRegions.has(name))) {
            refinements.push({ outlet: `${name}Buttons`, mode, items: buttons.map(button) });
        }
    }
    return refinements;
}

/**
 * Tells whether a contribution is one Scene 5 replaced with a contribution to an outlet of navigation: content whose
 * properties are a navigation item's (`label` and `targetScreen`), contributed to a contribution point.
 * @param value An entry of a screen's `contributions`.
 * @returns Whether it is a legacy navigation contribution.
 */
export function isLegacyNavigationContribution(value: unknown): value is JsonObject {
    if (!isObject(value) || typeof value.contributionPointName !== 'string') return false;
    return isObject(value.content) && isNavigationItemProperties(value.content.properties);
}

function isNavigationItemProperties(properties: unknown): boolean {
    return isObject(properties) && ['label', 'targetScreen'].every(key => typeof properties[key] === 'string');
}

function targetOf(properties: JsonObject, targetScreen: string): JsonObject {
    if (isObject(properties.destination)) return properties.destination;

    const target: JsonObject = { screen: targetScreen };
    if (isObject(properties.routeParameterBindings) && Object.keys(properties.routeParameterBindings).length > 0) {
        target.routeParameterBindings = properties.routeParameterBindings;
    }
    return target;
}

function contributedItem(contribution: JsonObject): { item: JsonObject; group?: string; order?: number } {
    const properties = (contribution.content as JsonObject).properties as JsonObject;
    const targetScreen = properties.targetScreen as string;
    const target = targetOf(properties, targetScreen);
    const item: JsonObject = { kind: 'navigation', id: textOf(properties.id) ?? targetScreen, title: properties.label };
    const icon = textOf(properties.icon);
    if (icon !== undefined) item.icon = icon;
    item.target = target;
    return { item, group: textOf(properties.group), order: numberOf(properties.order) ?? numberOf(contribution.order) };
}

interface Contributed { item: JsonObject; group?: string; order?: number; index: number }

function groupByPoint(contributions: unknown[]): Map<string, Contributed[]> {
    const byPoint = new Map<string, Contributed[]>();
    contributions.forEach((contribution, index) => {
        if (!isLegacyNavigationContribution(contribution)) return;
        const point = contribution.contributionPointName as string;
        if (!byPoint.has(point)) byPoint.set(point, []);
        byPoint.get(point)!.push({ ...contributedItem(contribution), index });
    });
    return byPoint;
}

function orderedItems(entries: Contributed[]): JsonObject[] {
    const ordered = [...entries].sort((a, b) => {
        if (a.order === undefined && b.order === undefined) return a.index - b.index;
        if (a.order === undefined) return 1;
        if (b.order === undefined) return -1;
        return a.order - b.order || a.index - b.index;
    });
    const items: JsonObject[] = [];
    const groups = new Map<string, JsonObject>();
    for (const entry of ordered) append(items, groups, entry);
    return items;
}

function append(items: JsonObject[], groups: Map<string, JsonObject>, entry: Contributed): void {
    if (entry.group === undefined) {
        items.push(entry.item);
        return;
    }
    let group = groups.get(entry.group);
    if (!group) {
        group = { kind: 'navigation', id: entry.group, title: entry.group, children: [] };
        groups.set(entry.group, group);
        items.push(group);
    }
    (group.children as JsonObject[]).push(entry.item);
}

/**
 * Upgrades the navigation contributions an owner - a screen - makes to contribution points into contributions to the
 * outlets of navigation those points are, in place. The items keep their declared `order` (items without one follow in
 * the order given); items with a `group` become the sub-items of a navigation item named after the group, placed where
 * the group's first item was. Every other contribution stays where it is.
 * @param owner The object with the `contributions`.
 * @returns Whether anything changed.
 */
export function upgradeNavigationContributions(owner: JsonObject): boolean {
    if (!Array.isArray(owner.contributions) || !owner.contributions.some(isLegacyNavigationContribution)) return false;

    const contributions: JsonObject[] = [];
    for (const [outlet, entries] of groupByPoint(owner.contributions as unknown[])) {
        contributions.push({ outlet, items: orderedItems(entries) });
    }

    owner.contributions = (owner.contributions as unknown[]).filter(contribution => !isLegacyNavigationContribution(contribution));
    owner.outletContributions = [...(Array.isArray(owner.outletContributions) ? owner.outletContributions : []), ...contributions];
    return true;
}
