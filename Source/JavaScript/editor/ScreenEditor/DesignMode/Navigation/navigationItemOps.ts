// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletNavigationItem } from '@cratis/scene.model';

// The pure list operations behind the item actions that Scene's navigation edits express as "these are the region's items": renaming, linking, moving,
// duplicating and removing one item of a level's own items, wherever it sits in the hierarchy. Each returns the new list and leaves the given one alone.

const mapItems = (items: readonly OutletNavigationItem[], id: string, change: (item: OutletNavigationItem) => OutletNavigationItem | undefined): OutletNavigationItem[] =>
    items.flatMap(item => {
        if (item.id === id) { const changed = change(item); return changed ? [changed] : []; }
        return [item.children ? { ...item, children: mapItems(item.children, id, change) } : item];
    });

const withoutUndefined = (item: OutletNavigationItem): OutletNavigationItem => Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined)) as unknown as OutletNavigationItem;

export const changeItem = (items: readonly OutletNavigationItem[], id: string, change: Partial<OutletNavigationItem>): OutletNavigationItem[] => mapItems(items, id, item => withoutUndefined({ ...item, ...change }));

export const removeItem = (items: readonly OutletNavigationItem[], id: string): OutletNavigationItem[] => mapItems(items, id, () => undefined);

export function findItem(items: readonly OutletNavigationItem[], id: string): OutletNavigationItem | undefined {
    for (const item of items) {
        if (item.id === id) return item;
        const inner = item.children ? findItem(item.children, id) : undefined;
        if (inner) return inner;
    }
    return undefined;
}

// The siblings an item sits among: the top level, or the children of its parent.
export function siblingsOf(items: readonly OutletNavigationItem[], id: string): readonly OutletNavigationItem[] | undefined {
    if (items.some(item => item.id === id)) return items;
    for (const item of items) {
        const inner = item.children ? siblingsOf(item.children, id) : undefined;
        if (inner) return inner;
    }
    return undefined;
}

// Moves an item to a position among its siblings.
export function moveItem(items: readonly OutletNavigationItem[], id: string, to: number): OutletNavigationItem[] {
    const sibling = siblingsOf(items, id);
    if (!sibling) return [...items];
    const from = sibling.findIndex(item => item.id === id);
    if (from < 0 || to < 0 || to >= sibling.length || from === to) return [...items];
    const reordered = [...sibling];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    return sibling === items ? reordered : replaceChildren(items, sibling, reordered);
}

function replaceChildren(items: readonly OutletNavigationItem[], from: readonly OutletNavigationItem[], to: OutletNavigationItem[]): OutletNavigationItem[] {
    return items.map(item => item.children === from ? { ...item, children: to } : item.children ? { ...item, children: replaceChildren(item.children, from, to) } : item);
}

// A copy of an item, and of what is under it, each with an identity of its own.
export const cloneItem = (item: OutletNavigationItem, newId: () => string): OutletNavigationItem => ({ ...structuredClone(item), id: newId(), ...(item.children ? { children: item.children.map(child => cloneItem(child, newId)) } : {}) });

// Puts a copy right after the item it is a copy of; the id of the copy is returned with the list.
export function duplicateItem(items: readonly OutletNavigationItem[], id: string, newId: () => string): { items: OutletNavigationItem[]; copy?: OutletNavigationItem } {
    const original = findItem(items, id);
    const sibling = siblingsOf(items, id);
    if (!original || !sibling) return { items: [...items] };
    const copy = cloneItem(original, newId);
    const at = sibling.findIndex(item => item.id === id) + 1;
    const next = [...sibling.slice(0, at), copy, ...sibling.slice(at)];
    return { items: sibling === items ? next : replaceChildren(items, sibling, next), copy };
}
