// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect } from 'react';
import { Theme } from '@cratis/scene.model';
import { applyPrimeReactTheme } from './applyPrimeReactTheme';
import { themeLinkElementId } from './primeReactThemeStylesheet';

/**
 * Keeps the loaded PrimeReact theme stylesheet in step with the active Scene {@link Theme}.
 *
 * Theming a Scene screen that uses this package takes two halves, and this is the half `SceneThemeProvider`
 * cannot do. The provider writes the theme's semantic tokens onto the wrapping element, which reaches
 * anything reading `--scene-*` - this package's own wrappers, `core`'s primitives, a layout's CSS. But
 * PrimeReact 10's components are skinned by a compiled stylesheet, and no amount of token-setting
 * changes which stylesheet is loaded. So: provider for the tokens, this hook for the stylesheet.
 *
 * Use them together:
 *
 * ```tsx
 * const [theme, setTheme] = useState(primeReactTheme('lara-light-blue'));
 * usePrimeReactTheme(theme);
 * return <SceneThemeProvider theme={theme}>{children}</SceneThemeProvider>;
 * ```
 *
 * Switching is live: nothing reloads, nothing below the provider remounts, and no state is lost. That is
 * what lets a gallery change theme as fast as someone can click through a picker, which is the whole
 * reason theme switching is re-resolution rather than a restart.
 *
 * @param theme The active theme. A theme this package does not ship - or `undefined` - leaves the loaded
 * stylesheet alone rather than unloading it, so a profile mixing in a theme from another package does
 * not strip PrimeReact's skin on its way past.
 * @param linkElementId The id of the stylesheet `<link>`, should the application use something other than
 * PrimeReact's conventional `theme-link`.
 */
export function usePrimeReactTheme(theme: Theme | undefined, linkElementId: string = themeLinkElementId): void {
    const themeName = theme?.name;

    useEffect(() => {
        if (themeName === undefined) return;
        applyPrimeReactTheme(themeName, linkElementId);
    }, [themeName, linkElementId]);
}
