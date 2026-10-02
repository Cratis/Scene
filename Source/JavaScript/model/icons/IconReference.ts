// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The persisted, renderer-neutral identity of one icon: which icon library it comes from, which icon
 * inside that library, and optionally which style variant of it.
 *
 * This is the only form in which a screen, template, blueprint or profile refers to an icon. It carries
 * no CSS class, no SVG and no component - those belong to a renderer's adapter for the library - so the
 * same reference renders on the web, on a phone, or anywhere else a library has an adapter.
 *
 * Identity is all three fields. A display name, a catalog position or a CSS class is never identity:
 * two libraries can each ship an icon called `home`, and `{ library: 'a', key: 'home' }` and
 * `{ library: 'b', key: 'home' }` are different icons that are never silently swapped for one another.
 */
export interface IconReference {
    /**
     * The identity of the icon library - the `name` of the {@link ScenePackage} of kind
     * {@link PackageKind.IconLibrary} that provides the icon.
     */
    library: string;

    /**
     * The stable key of the icon inside its library. Stable means a library keeps the key across
     * versions for as long as it ships the icon; it is not the icon's display name.
     */
    key: string;

    /**
     * The style variant (`outline`, `solid`, `filled` ...), or absent for a library or icon that has none.
     */
    variant?: string;
}

export const IconReferencePropertyNames: (keyof IconReference)[] = ['library', 'key', 'variant'];
