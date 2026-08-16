// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A named token/styling layer, declaring which component packages it is known to work with. An
 * incompatible theme/package pairing is a warning, not an error — the theme might still work by
 * coincidence, but the gap must be visible.
 */
export interface Theme {
    /**
     * The theme's name.
     */
    name: string;

    /**
     * The component packages this theme is declared compatible with.
     */
    compatibleWith: string[];

    /**
     * The theme's design tokens, keyed by semantic name (`primary.color`, `surface.background`,
     * `content.borderColor`, ...). Deliberately semantic rather than CSS: a renderer decides how a token
     * becomes a custom property, a native style, or anything else. Absent for a theme a package applies
     * by its own means rather than through tokens.
     */
    tokens?: Record<string, string>;

    /**
     * Whether the theme is a dark scheme, so a picker can group and preview it correctly.
     */
    isDark?: boolean;

    /**
     * Who created the theme. A theme adopted from somewhere else — PrimeTek's free presets, a community
     * theme — must credit its original creator here rather than appear to be ours.
     */
    author?: string;

    /**
     * A link to the original creator or the theme's home, shown alongside `author`.
     */
    authorUrl?: string;

    /**
     * The license the theme is used under, so redistributing it stays honest.
     */
    license?: string;

    /**
     * A one-line description for a theme picker.
     */
    description?: string;
}

export const ThemePropertyNames: (keyof Theme)[] = [
    'name',
    'compatibleWith',
    'tokens',
    'isDark',
    'author',
    'authorUrl',
    'license',
    'description',
];
