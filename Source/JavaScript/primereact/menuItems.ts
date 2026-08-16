// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MenuItem } from './MenuItem';
import { SceneElement } from '@cratis/scene.model';
import { arrayProperty } from './properties';

/**
 * Turns raw authored entries into the `MenuItem` model every PrimeReact menu, menubar, breadcrumb,
 * split button and dock takes.
 *
 * Ten different components in this package all want the same nested `{ label, icon, items }` shape, so
 * reading it lives here once rather than in each of them. Nesting is followed to any depth because a
 * menubar and a tiered menu differ only in how deep an author actually goes - the reader should not be
 * the thing that decides.
 *
 * Entries with no usable label are dropped rather than rendered blank, and a `separator: true` entry is
 * kept without one, because that is PrimeReact's own way of spelling a divider.
 *
 * @param entries The raw entries to convert.
 * @returns The converted menu items, in order.
 */
export function toMenuItems(entries: unknown[]): MenuItem[] {
    const items: MenuItem[] = [];
    for (const entry of entries) {
        if (typeof entry === 'string') {
            items.push({ label: entry });
            continue;
        }

        if (typeof entry !== 'object' || entry === undefined || entry === null || Array.isArray(entry)) continue;

        const record = entry as Record<string, unknown>;
        const item: MenuItem = {};
        if (typeof record.label === 'string') item.label = record.label;
        if (typeof record.icon === 'string') item.icon = record.icon;
        if (typeof record.url === 'string') item.url = record.url;
        if (typeof record.disabled === 'boolean') item.disabled = record.disabled;
        if (record.separator === true) item.separator = true;
        if (Array.isArray(record.items)) item.items = toMenuItems(record.items);
        if (item.label === undefined && item.separator !== true) continue;
        items.push(item);
    }

    return items;
}

/**
 * Reads a menu model off a Scene element's properties.
 *
 * @param element The element whose properties to read.
 * @param name The property name holding the entries.
 * @returns The converted menu items, empty when the property is missing or is not an array.
 */
export function menuItemsProperty(element: SceneElement, name: string): MenuItem[] {
    return toMenuItems(arrayProperty(element, name));
}
