// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { type ComponentUsage } from '@cratis/scene.engine';

// The keys the picker keeps its memory under (spec PICK4, PICK5). When the user is known the key is prefixed with their id, so two people
// sharing a browser do not share a toolbox.
export const componentUsageKey = 'cratis.studio.componentUsage.v1';
export const componentGroupsKey = 'cratis.studio.componentGroups.v1';

// The part of the browser's storage the picker needs.
export interface ComponentPickerStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

// What the picker remembers about a person: how often and how recently each component was added, and which groups were left open.
export interface ComponentPickerMemory {
    readUsage(): Record<string, ComponentUsage>;

    // Records one component added to a canvas, and returns the usage after it. Nothing else calls this (PICK4): hovering, or a drag that
    // is cancelled, is not use.
    recordAdded(key: string, now?: number): Record<string, ComponentUsage>;
    readGroups(): Record<string, boolean>;
    writeGroups(groups: Readonly<Record<string, boolean>>): void;
}

// Storage can be missing (a server render), blocked (private browsing, a policy), full or hold something else under the key; the picker then
// works from memory for as long as the page lives and forgets afterwards (PICK6) - it never throws.
const attempt = <T>(action: () => T): T | undefined => {
    try {
        return action();
    } catch {
        return undefined;
    }
};

export const browserComponentPickerStorage = (): ComponentPickerStorage | undefined =>
    attempt(() => (typeof window !== 'undefined' ? window.localStorage : undefined));

const parseUsage = (text: string | null | undefined): Record<string, ComponentUsage> => {
    const parsed = attempt(() => JSON.parse(text ?? 'null') as unknown);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const usage: Record<string, ComponentUsage> = {};
    for (const [key, entry] of Object.entries(parsed as Record<string, Partial<ComponentUsage> | null>)) {
        if (entry && typeof entry.count === 'number' && Number.isFinite(entry.count) && entry.count > 0) {
            usage[key] = { count: Math.floor(entry.count), last: typeof entry.last === 'number' && Number.isFinite(entry.last) ? entry.last : 0 };
        }
    }

    return usage;
};

const parseGroups = (text: string | null | undefined): Record<string, boolean> => {
    const parsed = attempt(() => JSON.parse(text ?? 'null') as unknown);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'));
};

export function createComponentPickerMemory(storage: ComponentPickerStorage | undefined = browserComponentPickerStorage(), userId?: string): ComponentPickerMemory {
    const usageKey = userId ? `${userId}:${componentUsageKey}` : componentUsageKey;
    const groupsKey = userId ? `${userId}:${componentGroupsKey}` : componentGroupsKey;

    // What was last read or written, so a blocked or full storage still gives the session its own memory.
    let usage: Record<string, ComponentUsage> | undefined;
    let groups: Record<string, boolean> | undefined;

    return {
        readUsage: () => (usage ??= parseUsage(storage ? attempt(() => storage.getItem(usageKey)) : undefined)),
        recordAdded: (key, now = Date.now()) => {
            const current = (usage ??= parseUsage(storage ? attempt(() => storage.getItem(usageKey)) : undefined));
            usage = { ...current, [key]: { count: (current[key]?.count ?? 0) + 1, last: now } };
            const text = JSON.stringify(usage);
            if (storage) attempt(() => storage.setItem(usageKey, text));
            return usage;
        },
        readGroups: () => (groups ??= parseGroups(storage ? attempt(() => storage.getItem(groupsKey)) : undefined)),
        writeGroups: next => {
            groups = { ...next };
            const text = JSON.stringify(groups);
            if (storage) attempt(() => storage.setItem(groupsKey, text));
        },
    };
}
