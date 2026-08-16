// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { themePresets } from './themePresets';

/**
 * The packages a PrimeReact theme declares itself compatible with.
 *
 * `PrimeReact` and `Tailwind` are obvious - the preset skins PrimeReact's components, and this package's
 * own wrappers lay themselves out with Tailwind utilities.
 *
 * `core` is the interesting one, and it is listed deliberately rather than by reflex. A theme reaches a
 * screen in two layers: the `--p-*` custom properties `@primeuix/styled` emits for the active preset,
 * which only PrimeReact's own components read, and a set of semantic Scene tokens that
 * `SceneThemeProvider` writes onto the wrapping element. The second layer applies to *everything*
 * underneath it, `core`'s unstyled primitives included - they inherit the theme's type color and can read
 * any token they choose to. So the claim being made is precise: these themes genuinely reach `core`'s
 * components, through tokens rather than through the component skin.
 *
 * This has to be said explicitly because `ThemeCompatibility` has no implicit exemption for `core`. A
 * theme that leaves it out is reported incompatible for every profile that lists `core`, which for a
 * theme that really does apply would be a false alarm on nearly every profile there is.
 */
export const primeReactThemeCompatibility: string[] = ['PrimeReact', 'Tailwind', 'core'];

/**
 * The license every theme in this catalog is published under.
 *
 * This is **not** MIT, and the difference matters enough to be a named constant rather than a string
 * repeated twenty-four times. PrimeReact 10 - presets included - was MIT. PrimeReact 11 relicensed the
 * entire stack (`primereact`, `@primereact/core`, `@primereact/headless`, `primeicons`,
 * `@primeuix/themes`, `@primeuix/styled`) under the commercial PrimeUI license, which requires a license
 * key: without one, `PrimeReactProvider` warns on the console and injects an "Invalid PrimeUI License"
 * banner, in development and production alike.
 *
 * `Theme`'s `license` field exists so a theme picker, an audit, or a person reading the catalog can see
 * what they are actually taking on. Reporting these as MIT because the *previous* major was MIT is the
 * exact mistake the field is there to prevent.
 *
 * @see https://primeui.dev/licenses/community for the free community tier and its eligibility limits.
 * @see https://primeui.dev/licenses/commercial for the paid tier.
 */
export const primeReactThemeLicense = 'PrimeUI Commercial';

/**
 * Every theme this package ships, as Scene {@link Theme}s.
 *
 * None of these themes are ours. They are PrimeTek's `@primeuix/themes` presets - Aura, Lara, Nora and
 * Material - with one of the preset's own primitive color ramps bound to its primary scale. Choosing
 * which accent to bind is the only design decision Scene makes here, and it is not enough to claim
 * authorship over: the surface ramps, the radii, the focus rings, the component styling and the design
 * language are all PrimeTek's work.
 *
 * That is what `Theme`'s `author`, `authorUrl` and `license` fields exist to record, and why the credit
 * is applied here, once, to every preset, rather than written out per theme where it could be forgotten.
 */
export const primeReactThemes: Theme[] = themePresets.map((preset) => ({
    ...preset,
    compatibleWith: primeReactThemeCompatibility,
    author: 'PrimeTek',
    authorUrl: 'https://primereact.org',
    license: primeReactThemeLicense,
}));

/**
 * The names of every theme this package ships, in catalog order - what the manifest declares and what a
 * theme picker lists.
 */
export const primeReactThemeNames: string[] = primeReactThemes.map((theme) => theme.name);

/**
 * Finds one of this package's themes by name.
 *
 * @param name The theme name.
 * @returns The theme, or `undefined` when this package does not ship one by that name.
 */
export function primeReactTheme(name: string): Theme | undefined {
    return primeReactThemes.find((theme) => theme.name === name);
}
