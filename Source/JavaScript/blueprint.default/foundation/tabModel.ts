// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One tab or sub-section: an id the address and the slot content use, a label, and an optional count badge. */
export interface TabItem {
    id: string;
    label: string;
    badge?: string;
    disabled: boolean;
}

/** Reads tabs out of a property value; entries without an id are dropped and a repeated id keeps its first. */
export function readTabs(value: unknown): TabItem[] {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    return value.flatMap((entry): TabItem[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { id, label, badge, disabled } = entry as Record<string, unknown>;
        if (typeof id !== 'string' || id.length === 0 || seen.has(id)) return [];
        seen.add(id);
        return [{ id, label: typeof label === 'string' && label.length > 0 ? label : id, disabled: disabled === true, ...(typeof badge === 'string' || typeof badge === 'number' ? { badge: String(badge) } : {}) }];
    });
}

/** The active tab: the requested one when it exists and is enabled, else the first enabled one. Deep links to a tab that was removed fall back instead of showing nothing. */
export function activeTab(tabs: TabItem[], requested: string | undefined): string | undefined {
    const wanted = tabs.find(tab => tab.id === requested && !tab.disabled);
    return (wanted ?? tabs.find(tab => !tab.disabled))?.id;
}

/** The enabled tab one step from the current one, wrapping, or the first/last for Home and End. */
export function stepTab(tabs: TabItem[], current: string | undefined, direction: 'next' | 'previous' | 'first' | 'last'): string | undefined {
    const enabled = tabs.filter(tab => !tab.disabled);
    if (enabled.length === 0) return undefined;
    if (direction === 'first') return enabled[0].id;
    if (direction === 'last') return enabled[enabled.length - 1].id;

    const index = Math.max(0, enabled.findIndex(tab => tab.id === current));
    return enabled[(index + (direction === 'next' ? 1 : -1) + enabled.length) % enabled.length].id;
}
