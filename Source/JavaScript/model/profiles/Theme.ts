// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A named token/styling layer, declaring which component packages it is known to work with. An
 * incompatible theme/package pairing is a warning, not an error — the theme might still work by
 * coincidence, but the gap must be visible. The token model's own shape (colors, spacing, typography)
 * is intentionally out of scope here — `compatibleWith` is what the engine and Stage's build need to
 * validate compatibility; applying tokens is a renderer concern.
 */
export interface Theme {
    name: string;
    compatibleWith: string[];
}

export const ThemePropertyNames: (keyof Theme)[] = ['name', 'compatibleWith'];
