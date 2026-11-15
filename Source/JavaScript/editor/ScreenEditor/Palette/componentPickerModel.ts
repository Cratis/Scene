// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentBadge, matchComponentQuery, rankFrequentlyUsedComponents, type ComponentQueryMatch, type ComponentUsage } from '@cratis/scene.engine';
import { ComponentCategory, componentCategories, type ComponentDescriptor } from '@cratis/scene.model';
import type { PalettePayload } from './PaletteEntry';

// One thing the picker lists: a component of a package, or a layout container. Everything it shows comes from the component's descriptor (PICK1):
// its category, display name, badge and keywords - nothing is listed by name in the picker itself.
export interface PickerEntry {
    // Identifies the entry for usage and for the DOM: `package:name` for a component, `layout:Item` for a layout container.
    key: string;
    label: string;
    badge: string;
    category: string;
    keywords: readonly string[];

    // The package that offers the component and the name it is shown under, as a secondary label. Absent for a layout container.
    package?: string;
    packageTitle?: string;
    payload: PalettePayload;
}

// What the picker needs to know about the components a package offers: the names, and the descriptors that say how to present them.
export interface PickerSource {
    package: string;
    components: readonly string[];
    descriptors?: readonly ComponentDescriptor[];
}

// A layout container the picker offers beside the components, with the words it is shown as. They are structure the editor itself provides, so
// they are the one thing here no descriptor describes; they are listed under the Layout category.
export interface PickerLayout {
    item: string;
    label: string;
}

// Components of a package that are structure of it rather than something an author drops onto a screen on their own.
const notDroppable = new Set(['column', 'screenShell', 'shell']);

// The category a component falls under when its package declares none - a package written before categories. Shown as a group of its own so the
// component is still found; the shared registry specification (CMP1) keeps in-repo packages out of it.
export const uncategorised = 'Other';

const bareName = (name: string): string => name.slice(name.lastIndexOf(':') + 1);
const words = (name: string): string => name.replace(/([A-Z])/g, ' $1').replace(/^./, first => first.toUpperCase()).trim();

// What a package is called when the host says nothing: its name, split into words.
const readablePackage = (packageName: string): string => packageName.split('.').map(part => words(part)).join(' ');

export const layoutCategory = ComponentCategory.Layout;

export function buildPickerEntries(sources: readonly PickerSource[], layouts: readonly PickerLayout[], packageTitles: Readonly<Record<string, string>> = {}): PickerEntry[] {
    const layoutEntries = layouts.map<PickerEntry>(layout => ({
        key: `layout:${layout.item}`,
        label: layout.label,
        badge: componentBadge({ component: layout.item, displayName: layout.label }),
        category: layoutCategory,
        keywords: [],
        payload: { kind: 'layout', item: layout.item as never },
    }));

    const componentEntries = sources.flatMap(source => {
        const described = new Map(
            (source.descriptors ?? []).map(descriptor => [bareName(descriptor.component), descriptor] as const)
        );

        return source.components
            .filter(name => !notDroppable.has(name))
            .map<PickerEntry>(name => {
                const descriptor = described.get(name);
                const label = descriptor?.displayName ?? words(name);
                return {
                    key: `${source.package}:${name}`,
                    label,
                    badge: componentBadge({ component: name, displayName: label, ...(descriptor?.badge ? { badge: descriptor.badge } : {}) }),
                    category: descriptor?.category?.trim() || uncategorised,
                    keywords: descriptor?.keywords ?? [],
                    package: source.package,
                    packageTitle: packageTitles[source.package] ?? readablePackage(source.package),
                    payload: { kind: 'component', componentName: name, package: source.package },
                };
            });
    });

    return [...layoutEntries, ...componentEntries];
}

export interface PickerRow {
    entry: PickerEntry;

    // How the entry answered the filter: which ranges of its label to highlight and, when only a keyword brought it in, which keyword.
    match: ComponentQueryMatch;
}

export interface PickerGroup {
    // `frequent` for the Frequently used group, otherwise the category.
    id: string;
    title: string;
    frequent: boolean;

    // How many rows the group lists now: all of its entries, or the ones that match the filter.
    count: number;
    expanded: boolean;
    rows: PickerRow[];
}

export interface PickerViewInputs {
    entries: readonly PickerEntry[];
    usage: Readonly<Record<string, ComponentUsage>>;
    query: string;

    // Which groups the author left open or closed, by group id; a group not in it follows the default (the first category open).
    groups: Readonly<Record<string, boolean>>;
    frequentTitle: string;
}

export const frequentGroupId = 'frequent';

// The groups the picker draws, in order: Frequently used first (PICK3, hidden when empty), then the categories in the order the model lists
// them, those it does not know after them alphabetically. With a filter (PICK2) only the entries that match are listed, a group with none
// is hidden, and every group that remains is open - the author's own open/closed choices are left alone so they are back when the filter clears.
export function buildPickerView({ entries, usage, query, groups, frequentTitle }: PickerViewInputs): PickerGroup[] {
    const filtering = query.trim().length > 0;
    const rowOf = (entry: PickerEntry): PickerRow => ({
        entry,
        match: matchComponentQuery({ component: entry.key, displayName: entry.label, category: entry.category, keywords: [...entry.keywords] }, query),
    });
    const matching = (list: readonly PickerEntry[]): PickerRow[] => list.map(rowOf).filter(row => row.match.matched);

    const byKey = new Map(entries.map(entry => [entry.key, entry]));
    const frequentEntries = rankFrequentlyUsedComponents(usage).flatMap(key => byKey.get(key) ?? []);
    const result: PickerGroup[] = [];

    const frequentRows = matching(frequentEntries);
    if (frequentRows.length > 0) {
        result.push({ id: frequentGroupId, title: frequentTitle, frequent: true, count: frequentRows.length, expanded: filtering || (groups[frequentGroupId] ?? true), rows: frequentRows });
    }

    const categories = [...new Set(entries.map(entry => entry.category))].sort((left, right) => {
        const known = (category: string) => componentCategories.indexOf(category);
        return (known(left) < 0 ? 1000 : known(left)) - (known(right) < 0 ? 1000 : known(right)) || left.localeCompare(right);
    });
    categories.forEach((category, index) => {
        const rows = matching(entries.filter(entry => entry.category === category));
        if (rows.length === 0) return;
        const open = groups[category] ?? (index === 0 && frequentRows.length === 0);
        result.push({ id: category, title: category, frequent: false, count: rows.length, expanded: filtering || open, rows });
    });

    return result;
}

// The rows in the order they are drawn and reached with the keyboard: those of the groups that are open.
export const visibleRows = (view: readonly PickerGroup[]): { group: PickerGroup; row: PickerRow }[] =>
    view.filter(group => group.expanded).flatMap(group => group.rows.map(row => ({ group, row })));

// The text split into the parts around the ranges to highlight, for drawing it with the matches marked.
export function highlightParts(text: string, ranges: readonly [number, number][]): { text: string; marked: boolean }[] {
    const parts: { text: string; marked: boolean }[] = [];
    let at = 0;
    for (const [start, end] of [...ranges].sort((left, right) => left[0] - right[0])) {
        if (start > at) parts.push({ text: text.slice(at, start), marked: false });
        parts.push({ text: text.slice(start, end), marked: true });
        at = end;
    }

    if (at < text.length) parts.push({ text: text.slice(at), marked: false });
    return parts;
}
