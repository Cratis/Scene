// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One icon in an icon library's catalog: what a picker needs to find it and a reference needs to name it.
 *
 * An entry is metadata only. It holds no SVG, class name or component - that is the renderer's concern,
 * resolved lazily per icon by the adapter - so a catalog is cheap to load and identical for every
 * renderer. The {@link IconReference} that names the icon is the entry's `key` (and one of its
 * `variants`) together with the library the catalog belongs to.
 */
export interface IconEntry {
    /**
     * The stable key within the library; what an {@link IconReference} persists.
     */
    key: string;

    /**
     * The display name a picker shows. Never identity - two libraries may share a name.
     */
    name: string;

    /**
     * The categories the icon is filed under, for browsing.
     */
    categories: string[];

    /**
     * Alternative names to find the icon by (`bin` for `trash`).
     */
    aliases?: string[];

    /**
     * Free-form search terms.
     */
    tags?: string[];

    /**
     * The variants this icon exists in. Absent or empty when the icon has no variants, in which case
     * references to it carry none.
     */
    variants?: string[];
}

export const IconEntryPropertyNames: (keyof IconEntry)[] = ['key', 'name', 'categories', 'aliases', 'tags', 'variants'];
