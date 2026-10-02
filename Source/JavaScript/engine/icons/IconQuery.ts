// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a picker asks the effective catalog for. Every field narrows; an empty query returns everything.
 */
export interface IconQuery {
    /**
     * Free text, matched case-insensitively against each icon's name, key, aliases and tags.
     */
    text?: string;

    /**
     * Only the icons of this library. Narrowing to one library also means only that library's catalog is loaded.
     */
    library?: string;

    /**
     * Only the icons filed under this category.
     */
    category?: string;

    /**
     * Only the icons that exist in this variant.
     */
    variant?: string;
}
