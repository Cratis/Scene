// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

type Defaults = Record<string, unknown>;
type Entry = Record<string, unknown>;

const isEntry = (value: unknown): value is Entry => typeof value === 'object' && value !== null && !Array.isArray(value);

// Merges two sets of component defaults one component at a time, and within a component one part at a time: what the host gives a component
// is added to what the editor gives it, never in place of it. A host that says `{ Button: { props: { size: 'small' } } }` means a small button,
// not a button with no styles, which is what replacing the whole entry would give it. Where both set the same prop the host's wins.
export function mergeComponentDefaults<T extends Defaults>(editor: T, host: Defaults | undefined): T {
    if (!host) return editor;

    const merged: Defaults = { ...editor };
    for (const [component, entry] of Object.entries(host)) {
        const base = merged[component];
        merged[component] = isEntry(base) && isEntry(entry)
            ? { ...base, ...entry, ...(isEntry(base.props) || isEntry(entry.props) ? { props: { ...(isEntry(base.props) ? base.props : {}), ...(isEntry(entry.props) ? entry.props : {}) } } : {}) }
            : entry;
    }

    return merged as T;
}
