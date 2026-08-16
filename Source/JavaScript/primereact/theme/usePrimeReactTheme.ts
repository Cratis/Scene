// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { Theme } from '@cratis/scene.model';
import { PrimeReactPreset, primeReactThemePreset } from './primeReactThemePreset';

/**
 * The class a themed root carries when the active theme is a dark one.
 *
 * `@primeuix/themes` resolves every `light-dark()` token pair against a CSS selector rather than the
 * operating system preference, so *something* has to put that selector on the page. This is Scene's
 * choice of selector, and it is handed to the preset as `darkModeSelector` so the two can never disagree.
 */
export const primeReactDarkModeClass = 'scene-dark';

/**
 * The shape `PrimeReactProvider` takes through its `value` prop, narrowed to the part this package sets.
 *
 * Deliberately not imported from `@primereact/core`: the provider's config type is broad and mostly about
 * concerns Scene does not own (locale, ripple, z-index, filter match modes). Naming only the theme slice
 * keeps it obvious that a Scene theme decides the preset and nothing else, and leaves an application free
 * to merge its own configuration around it.
 */
export interface PrimeReactThemeConfiguration {
    /**
     * The preset and the options `@primeuix/styled` needs to emit its `--p-*` custom properties.
     */
    theme: {
        /**
         * The `@primeuix/themes` preset for the active Scene theme.
         */
        preset: PrimeReactPreset;

        /**
         * How the preset resolves its light/dark token pairs.
         */
        options: {
            /**
             * The selector that means "dark" - {@link primeReactDarkModeClass}.
             */
            darkModeSelector: string;
        };
    };
}

/**
 * Resolves the active Scene {@link Theme} to the configuration `PrimeReactProvider` needs to render it.
 *
 * Theming a Scene screen takes two halves, and this is the half `SceneThemeProvider` cannot do. The
 * provider writes the theme's semantic tokens onto the wrapping element, which reaches anything reading
 * `--scene-*` - this package's own wrappers, `core`'s primitives, a layout's CSS. But PrimeReact's own
 * components read `--p-*`, and those only exist once a preset has been handed to `PrimeReactProvider`. So:
 * `SceneThemeProvider` for the Scene tokens, this hook for the PrimeReact ones.
 *
 * This replaced the PrimeReact 10 hook of the same name, and it is considerably less machinery. v10
 * themes were compiled stylesheets, so switching meant locating a `<link>`, rewriting one path segment of
 * its URL, and swapping in a replacement element because some browsers will not re-fetch a mutated
 * `href`. None of that survives: a v11 preset is a plain object, so switching is re-rendering a provider
 * with a different value. Nothing is fetched, nothing flashes unstyled, and a theme cannot 404.
 *
 * Use them together:
 *
 * ```tsx
 * const [theme, setTheme] = useState(primeReactTheme('lara-light-blue'));
 * const configuration = usePrimeReactTheme(theme);
 *
 * return (
 *     <PrimeReactProvider value={configuration}>
 *         <SceneThemeProvider theme={theme}>{children}</SceneThemeProvider>
 *     </PrimeReactProvider>
 * );
 * ```
 *
 * @param theme The active theme. A theme this package does not ship - or `undefined` - yields `undefined`
 * rather than a default preset, so a profile mixing in a theme from another package leaves PrimeReact's
 * own styling to whoever does own it, instead of quietly overriding it with a Scene preset.
 * @returns The provider configuration, or `undefined` when this package ships no preset for the theme.
 */
export function usePrimeReactTheme(theme: Theme | undefined): PrimeReactThemeConfiguration | undefined {
    const themeName = theme?.name;

    return useMemo(() => {
        if (themeName === undefined) return undefined;

        const preset = primeReactThemePreset(themeName);
        if (preset === undefined) return undefined;

        return { theme: { preset, options: { darkModeSelector: `.${primeReactDarkModeClass}` } } };
    }, [themeName]);
}
