// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';

/** The theme token a shell reads its accent from. */
export const accentToken = 'primary.color';

/** The theme token holding readable text on the accent. */
export const accentContrastToken = 'primary.contrastColor';

/**
 * Whether a theme exposes the accent token. Only themes that do can show an accent; for the rest the
 * accent control is not offered rather than silently doing nothing.
 *
 * @param theme The theme to check.
 * @returns `true` when the theme has an accent token.
 */
export function supportsAccent(theme: Theme | undefined): boolean {
    return theme?.tokens?.[accentToken] !== undefined;
}

/**
 * Returns the themes with the accent applied to every one that supports it, choosing black or white text
 * for contrast. Themes that do not expose the token are returned untouched.
 *
 * @param themes The themes to adjust.
 * @param accent The accent as `#rrggbb`, or empty to leave the themes as they are.
 * @returns The adjusted themes; the inputs are not modified.
 */
export function applyAccent(themes: Theme[], accent: string): Theme[] {
    if (!/^#[0-9a-fA-F]{6}$/.test(accent)) return themes;

    return themes.map(theme =>
        supportsAccent(theme) ? { ...theme, tokens: { ...theme.tokens, [accentToken]: accent, [accentContrastToken]: contrastFor(accent) } } : theme,
    );
}

function contrastFor(hex: string): string {
    const [red, green, blue] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
    return luminance > 0.6 ? '#000000' : '#ffffff';
}
