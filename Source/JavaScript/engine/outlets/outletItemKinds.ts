// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletKind } from '@cratis/scene.model';

const allowed: Record<OutletKind, OutletItemKind[]> = {
    [OutletKind.Actions]: [OutletItemKind.Button, OutletItemKind.MenuEntry, OutletItemKind.Separator, OutletItemKind.Group],
    [OutletKind.Filters]: [OutletItemKind.Filter],
    [OutletKind.Tabs]: [OutletItemKind.Tab],
    [OutletKind.Stats]: [OutletItemKind.Stat],
    [OutletKind.Navigation]: [OutletItemKind.Navigation],
};

const descriptions: Record<OutletKind, string> = {
    [OutletKind.Actions]: 'buttons, menu entries, separators and groups',
    [OutletKind.Filters]: 'filters',
    [OutletKind.Tabs]: 'tabs',
    [OutletKind.Stats]: 'stats',
    [OutletKind.Navigation]: 'navigation items',
};

const itemNames: Record<OutletItemKind, string> = {
    [OutletItemKind.Button]: 'button',
    [OutletItemKind.MenuEntry]: 'menu entry',
    [OutletItemKind.Separator]: 'separator',
    [OutletItemKind.Group]: 'group',
    [OutletItemKind.Filter]: 'filter',
    [OutletItemKind.Tab]: 'tab',
    [OutletItemKind.Stat]: 'stat',
    [OutletItemKind.Navigation]: 'navigation item',
};

/** The item kinds a group of actions holds. */
export const groupItemKinds: OutletItemKind[] = [OutletItemKind.Button, OutletItemKind.MenuEntry, OutletItemKind.Separator];

/**
 * The item kinds an outlet of the given kind takes.
 * @param kind The outlet kind.
 * @returns The item kinds, in the order editors offer them.
 */
export function outletItemKinds(kind: OutletKind): OutletItemKind[] {
    return allowed[kind] ?? [];
}

/**
 * Says what an outlet of the given kind takes, for a message: "buttons, menu entries, separators and groups".
 * @param kind The outlet kind.
 * @returns The description.
 */
export function describeOutletItemKinds(kind: OutletKind): string {
    return descriptions[kind] ?? 'nothing';
}

/**
 * Names an item kind for a message: "menu entry", "navigation item".
 * @param kind The item kind.
 * @returns The name.
 */
export function outletItemKindName(kind: OutletItemKind): string {
    return itemNames[kind] ?? String(kind);
}
