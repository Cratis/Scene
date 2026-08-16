// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactTheme } from './primeReactThemes';

/**
 * The module path of a theme's compiled stylesheet.
 *
 * PrimeReact 10 themes are pre-compiled CSS files on disk, one folder per theme, so switching theme is
 * ultimately a question of which file is loaded. This is the one place that knows the layout of those
 * folders.
 *
 * An unknown name returns `undefined` rather than a plausible-looking path. A string built for a theme
 * that does not exist would produce a 404 at load time and an unstyled application - a failure that
 * shows up far from the typo that caused it - whereas `undefined` is checkable at the call site.
 *
 * @param themeName The theme name, as it appears in {@link primeReactThemes}.
 * @returns The stylesheet path, or `undefined` when this package ships no theme by that name.
 */
export function primeReactThemeStylesheet(themeName: string): string | undefined {
    return primeReactTheme(themeName) === undefined ? undefined : `primereact/resources/themes/${themeName}/theme.css`;
}

/**
 * The id of the `<link>` element the theme stylesheet is loaded through.
 *
 * PrimeReact's own `PrimeReactContext.changeTheme` takes this id as an argument and defaults to nothing;
 * `theme-link` is the id PrimeReact's documentation and templates use, so matching it means an
 * application already set up for PrimeReact theme switching needs no extra wiring to work with
 * {@link usePrimeReactTheme}.
 */
export const themeLinkElementId = 'theme-link';
