// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

type JsonObject = { [key: string]: unknown };

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const legacyModes: Record<string, string> = { inherit: 'inherits', extend: 'extends', override: 'overrides' };

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
    const regions = application.regions as JsonObject[];
    const buttonRegions = new Set<string>();
    const outlets: JsonObject[] = [];
    for (const region of regions) {
        const name = region.region as string;
        outlets.push({ name, kind: 'navigation', defaults: itemsOf(region, 'items').map(navigationItem) });
        const buttons = itemsOf(region, 'buttons');
        if (buttons.length > 0) {
            buttonRegions.add(name);
            outlets.push({ name: `${name}Buttons`, kind: 'actions', defaults: buttons.map(button) });
        }
    }

    const upgraded: JsonObject = { outlets };
    for (const [key, value] of Object.entries(application)) {
        if (key !== 'regions') upgraded[key] = value;
    }
    navigation.application = upgraded;

    navigation.modules = (navigation.modules as JsonObject[]).map(module => {
        if (!Array.isArray(module.regions)) return module;
        const refinements: JsonObject[] = [];
        for (const region of module.regions as JsonObject[]) {
            const name = region.region as string;
            const mode = legacyModes[typeof region.mode === 'string' ? region.mode : 'inherit'] ?? 'inherits';
            if (mode === 'inherits') continue;
            refinements.push({ outlet: name, mode, items: itemsOf(region, 'items').map(navigationItem) });
            const buttons = itemsOf(region, 'buttons');
            if (buttons.length > 0 || (mode === 'overrides' && buttonRegions.has(name))) {
                refinements.push({ outlet: `${name}Buttons`, mode, items: buttons.map(button) });
            }
        }
        const result: JsonObject = {};
        for (const [key, value] of Object.entries(module)) {
            if (key === 'regions') {
                if (refinements.length > 0) result.refinements = refinements;
            } else {
                result[key] = value;
            }
        }
        return result;
    });
}

/**
 * Tells whether a contribution is one Scene 5 replaced with a contribution to an outlet of navigation: content whose
 * properties are a navigation item's (`label` and `targetScreen`), contributed to a contribution point.
 * @param value An entry of a screen's `contributions`.
 * @returns Whether it is a legacy navigation contribution.
 */
export function isLegacyNavigationContribution(value: unknown): value is JsonObject {
    if (!isObject(value) || typeof value.contributionPointName !== 'string' || !isObject(value.content)) return false;
    const properties = value.content.properties;
    return isObject(properties) && typeof properties.label === 'string' && typeof properties.targetScreen === 'string';
}

function contributedItem(contribution: JsonObject): { item: JsonObject; group?: string; order?: number } {
    const properties = (contribution.content as JsonObject).properties as JsonObject;
    const targetScreen = properties.targetScreen as string;
    let target: JsonObject;
    if (isObject(properties.destination)) {
        target = properties.destination;
    } else {
        target = { screen: targetScreen };
        if (isObject(properties.routeParameterBindings) && Object.keys(properties.routeParameterBindings).length > 0) {
            target.routeParameterBindings = properties.routeParameterBindings;
        }
    }
    const item: JsonObject = { kind: 'navigation', id: typeof properties.id === 'string' ? properties.id : targetScreen, title: properties.label };
    if (typeof properties.icon === 'string') item.icon = properties.icon;
    item.target = target;
    const order = typeof properties.order === 'number' ? properties.order : typeof contribution.order === 'number' ? contribution.order : undefined;
    return { item, group: typeof properties.group === 'string' ? properties.group : undefined, order };
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

    const byPoint = new Map<string, { item: JsonObject; group?: string; order?: number; index: number }[]>();
    (owner.contributions as unknown[]).forEach((contribution, index) => {
        if (!isLegacyNavigationContribution(contribution)) return;
        const point = contribution.contributionPointName as string;
        if (!byPoint.has(point)) byPoint.set(point, []);
        byPoint.get(point)!.push({ ...contributedItem(contribution), index });
    });

    const contributions: JsonObject[] = [];
    for (const [outlet, entries] of byPoint) {
        const ordered = [...entries].sort((a, b) => {
            if (a.order === undefined && b.order === undefined) return a.index - b.index;
            if (a.order === undefined) return 1;
            if (b.order === undefined) return -1;
            return a.order - b.order || a.index - b.index;
        });
        const items: JsonObject[] = [];
        const groups = new Map<string, JsonObject>();
        for (const entry of ordered) {
            if (entry.group === undefined) {
                items.push(entry.item);
                continue;
            }
            let group = groups.get(entry.group);
            if (!group) {
                group = { kind: 'navigation', id: entry.group, title: entry.group, children: [] };
                groups.set(entry.group, group);
                items.push(group);
            }
            (group.children as JsonObject[]).push(entry.item);
        }
        contributions.push({ outlet, items });
    }

    owner.contributions = (owner.contributions as unknown[]).filter(contribution => !isLegacyNavigationContribution(contribution));
    owner.outletContributions = [...(Array.isArray(owner.outletContributions) ? owner.outletContributions : []), ...contributions];
    return true;
}
