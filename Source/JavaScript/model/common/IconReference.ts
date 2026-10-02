// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A qualified reference to one icon: the library it comes from, its key within that library and an optional
 * style variant. This is the renderer-neutral, persisted form of an icon choice.
 *
 * Identity is all three fields. A label, a display name, a CSS class, an SVG or a position in a catalog is
 * never identity - none of them survive a library upgrade, and a persisted choice has to.
 */
export interface IconReference {
    /** The stable identity of the icon library package the icon belongs to. */
    library: string;

    /** The stable key of the icon within `library`. */
    key: string;

    /** The style variant (outlined, filled, ...), when the library has them. */
    variant?: string;
}

export const IconReferencePropertyNames: (keyof IconReference)[] = ['library', 'key', 'variant'];
