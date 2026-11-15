// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletItem } from '@cratis/scene.model';

// The plain list operations on the items a level owns in an outlet - rename, bind, move, duplicate, remove, add a sub-item - wherever an item sits: at the
// top, among a navigation item's `children` or a group's `items`. Each returns a new list and leaves the given one alone. Which items an outlet shows, and in
// what order around the inherited ones, is Scene's to say; these only change what the level itself holds.

type Nested = OutletItem & { children?: OutletItem[]; items?: OutletItem[] };

const nestedOf = (item: OutletItem): { key: 'children' | 'items'; items: OutletItem[] } | undefined => {
    const nested = item as Nested;
    if (Array.isArray(nested.children)) return { key: 'children', items: nested.children };
    if (Array.isArray(nested.items)) return { key: 'items', items: nested.items };
    return undefined;
};

const withoutUndefined = (item: OutletItem): OutletItem => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)) as unknown as OutletItem;

function mapItems(items: readonly OutletItem[], id: string, change: (item: OutletItem) => OutletItem | undefined): OutletItem[] {
    return items.flatMap(item => {
        if (item.id === id) {
            const changed = change(item);
            return changed ? [changed] : [];
        }
        const nested = nestedOf(item);
        return [nested ? { ...item, [nested.key]: mapItems(nested.items, id, change) } as OutletItem : item];
    });
}

export function findOutletItem(items: readonly OutletItem[], id: string): OutletItem | undefined {
    for (const item of items) {
        if (item.id === id) return item;
        const nested = nestedOf(item);
        const inner = nested ? findOutletItem(nested.items, id) : undefined;
        if (inner) return inner;
    }
    return undefined;
}

// The items an item sits among: the top level, or the children of the item it is nested under.
export function siblingsOfOutletItem(items: readonly OutletItem[], id: string): readonly OutletItem[] | undefined {
    if (items.some(item => item.id === id)) return items;
    for (const item of items) {
        const nested = nestedOf(item);
        const found = nested ? siblingsOfOutletItem(nested.items, id) : undefined;
        if (found) return found;
    }
    return undefined;
}

export const changeOutletItem = (items: readonly OutletItem[], id: string, change: Record<string, unknown>): OutletItem[] =>
    mapItems(items, id, item => withoutUndefined({ ...item, ...change } as OutletItem));

export const removeOutletItem = (items: readonly OutletItem[], id: string): OutletItem[] => mapItems(items, id, () => undefined);

export function moveOutletItem(items: readonly OutletItem[], id: string, to: number): OutletItem[] {
    const reorder = (list: readonly OutletItem[]): OutletItem[] => {
        const from = list.findIndex(item => item.id === id);
        if (from < 0) return list.map(item => {
            const nested = nestedOf(item);
            return nested ? { ...item, [nested.key]: reorder(nested.items) } as OutletItem : item;
        });
        const next = [...list];
        const [moved] = next.splice(from, 1);
        next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
        return next;
    };
    return reorder(items);
}

// A copy of the item, and every item under it, with fresh ids, placed right after it.
export function duplicateOutletItem(items: readonly OutletItem[], id: string, newId: () => string): { items: OutletItem[]; copy?: OutletItem } {
    const original = findOutletItem(items, id);
    if (!original) return { items: [...items] };
    const fresh = (item: OutletItem): OutletItem => {
        const nested = nestedOf(item);
        const copied = { ...item, id: newId() } as OutletItem;
        return nested ? { ...copied, [nested.key]: nested.items.map(fresh) } as OutletItem : copied;
    };
    const copy = fresh(original);
    const insertAfter = (list: readonly OutletItem[]): OutletItem[] => list.flatMap(item => {
        if (item.id === id) return [item, copy];
        const nested = nestedOf(item);
        return [nested ? { ...item, [nested.key]: insertAfter(nested.items) } as OutletItem : item];
    });
    return { items: insertAfter(items), copy };
}

// The item added under another - a navigation item's sub-item.
export const addOutletSubItem = (items: readonly OutletItem[], parentId: string, child: OutletItem): OutletItem[] =>
    mapItems(items, parentId, item => ({ ...item, children: [...((item as Nested).children ?? []), child] } as OutletItem));
