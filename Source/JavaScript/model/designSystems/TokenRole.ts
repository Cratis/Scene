// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What one design token is for. A token is addressed as `<category>.<name>`, such as `color.primary` or `space.md`; the
 * description is the contract a theme author reads to choose a value.
 */
export interface TokenRole {
    /** The token's category: `color`, `space`, `size`, `radius`, `border`, `shadow`, `font`, `type`, `motion`, `opacity` or `z`. */
    category: string;

    /** The token's name, unique within its category. */
    name: string;

    /** What the token is for. */
    description?: string;
}

export const TokenRolePropertyNames: (keyof TokenRole)[] = ['category', 'name', 'description'];
