// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor } from '@cratis/scene.model';

/**
 * How a component answers a picker's filter text (spec PICK2).
 */
export interface ComponentQueryMatch {
    /** The component is shown for this filter. */
    matched: boolean;

    /** What matched, strongest first: the display name, the category, or one of the keywords. Absent when nothing matched. */
    via?: 'name' | 'category' | 'keyword';

    /** The `[start, end)` ranges of the display name to highlight. Empty unless the name matched. */
    ranges: [number, number][];

    /** The keyword the component matched through. Present only when `via` is `keyword`: the picker shows it as a hint. */
    keyword?: string;
}

/**
 * Decides whether a component is shown for the text typed in a picker's filter, and why.
 *
 * Matching is case-insensitive. The display name (or, when the descriptor has none, the bare component name) and the keywords match by
 * substring. The category matches by the start of one of its words - `nav` finds every Navigation component, while `ta` does not find
 * everything under `Data display`, which a substring match on the category would. A component is shown when any of the three
 * match; it reports the first of name, category, keyword that did, so the picker highlights the name and shows a hint only when a
 * keyword alone brought the component in. An empty filter matches everything and highlights nothing.
 */
export function matchComponentQuery(descriptor: Pick<ComponentDescriptor, 'component' | 'displayName' | 'category' | 'keywords'>, query: string): ComponentQueryMatch {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return { matched: true, ranges: [] };

    const name = descriptor.displayName ?? descriptor.component.slice(descriptor.component.lastIndexOf(':') + 1);
    const ranges = occurrencesOf(name.toLowerCase(), needle);
    if (ranges.length > 0) return { matched: true, via: 'name', ranges };

    if (descriptor.category !== undefined && descriptor.category.toLowerCase().split(/\s+/).some(word => word.startsWith(needle))) {
        return { matched: true, via: 'category', ranges: [] };
    }

    const keyword = (descriptor.keywords ?? []).find(candidate => candidate.toLowerCase().includes(needle));
    return keyword === undefined ? { matched: false, ranges: [] } : { matched: true, via: 'keyword', ranges: [], keyword };
}

function occurrencesOf(text: string, needle: string): [number, number][] {
    const found: [number, number][] = [];
    for (let at = text.indexOf(needle); at >= 0; at = text.indexOf(needle, at + needle.length)) {
        found.push([at, at + needle.length]);
    }

    return found;
}
