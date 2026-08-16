// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { themePresets } from './themePresets';

/**
 * The packages a PrimeReact theme declares itself compatible with.
 *
 * `PrimeReact` and `Tailwind` are obvious - the stylesheet skins PrimeReact's components, and this
 * package's own wrappers lay themselves out with Tailwind utilities.
 *
 * `core` is the interesting one, and it is listed deliberately rather than by reflex. A theme reaches a
 * screen in two layers: a stylesheet that only ever matches PrimeReact's own `.p-*` elements, and a set
 * of semantic Scene tokens that `SceneThemeProvider` writes onto the wrapping element. The second layer
 * applies to *everything* underneath it, `core`'s unstyled primitives included - they inherit the
 * theme's type color and can read any token they choose to. So the claim being made is precise: these
 * themes genuinely reach `core`'s components, through tokens rather than through the component skin.
 *
 * This has to be said explicitly because `ThemeCompatibility` has no implicit exemption for `core`. A
 * theme that leaves it out is reported incompatible for every profile that lists `core`, which for a
 * theme that really does apply would be a false alarm on nearly every profile there is.
 */
export const primeReactThemeCompatibility: string[] = ['PrimeReact', 'Tailwind', 'core'];

/**
 * Every free PrimeReact 10 theme this package ships, as Scene {@link Theme}s.
 *
 * None of these themes are ours. They are PrimeTek's, shipped under the MIT license that covers the
 * whole `primereact` package (verified in `node_modules/primereact/LICENSE.md`: "The MIT License (MIT),
 * Copyright (c) 2016-2025 PrimeTek"). Redistributing them without saying so would be dishonest, which is
 * what `Theme`'s `author`, `authorUrl` and `license` fields exist to prevent - and why the credit is
 * applied here, once, to every preset, rather than written out per theme where it could be forgotten.
 *
 * Several themes are PrimeTek's interpretation of someone else's design language - Bootstrap, Material
 * Design, Fluent, Tailwind UI. The compiled CSS is still PrimeTek's own work, so PrimeTek is still the
 * author; the lineage is recorded in each theme's description instead of by misattributing the file.
 */
export const primeReactThemes: Theme[] = themePresets.map((preset) => ({
    ...preset,
    compatibleWith: primeReactThemeCompatibility,
    author: 'PrimeTek',
    authorUrl: 'https://primereact.org',
    license: 'MIT',
}));

/**
 * The names of every theme this package ships, in catalog order - what the manifest declares and what a
 * theme picker lists.
 */
export const primeReactThemeNames: string[] = primeReactThemes.map((theme) => theme.name);

/**
 * Finds one of this package's themes by name.
 *
 * @param name The theme name, which is also its folder under `primereact/resources/themes`.
 * @returns The theme, or `undefined` when this package does not ship one by that name.
 */
export function primeReactTheme(name: string): Theme | undefined {
    return primeReactThemes.find((theme) => theme.name === name);
}
