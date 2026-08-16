// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Material from '@primeuix/themes/material';
import Nora from '@primeuix/themes/nora';
import { PrimeReactThemeFamily } from './PrimeReactThemeFamily';
import { themePresets } from './themePresets';

/**
 * A `@primeuix/themes` preset, as `PrimeReactProvider` wants it.
 *
 * `@primeuix/themes` types this as `Preset`, but the type is generic over the preset's own token shape
 * and the four families do not share one instantiation, so naming the union here rather than importing
 * `Preset` keeps the call sites free of casts.
 */
export type PrimeReactPreset = typeof Aura | typeof Lara | typeof Nora | typeof Material;

/**
 * The base preset object for each family.
 *
 * These are PrimeTek's own preset exports, untouched. The accent binding in
 * {@link primeReactThemePreset} is applied on top with `definePreset`, which merges rather than mutates -
 * important, because these objects are module singletons and two themes tinted differently must not
 * fight over one shared object.
 */
const basePresets: Record<PrimeReactThemeFamily, PrimeReactPreset> = {
    [PrimeReactThemeFamily.Aura]: Aura,
    [PrimeReactThemeFamily.Lara]: Lara,
    [PrimeReactThemeFamily.Nora]: Nora,
    [PrimeReactThemeFamily.Material]: Material,
};

/**
 * Presets are built once per theme name and reused.
 *
 * `definePreset` deep-merges, so calling it per render would produce a new object every time - and
 * `PrimeReactProvider` treats a new preset identity as a theme change, which re-emits every `--p-*`
 * custom property. Caching keeps switching themes cheap and, more importantly, keeps *not* switching
 * free.
 */
const presetCache = new Map<string, PrimeReactPreset>();

/**
 * Resolves one of this package's themes to the `@primeuix/themes` preset that renders it.
 *
 * This is what replaced `primeReactThemeStylesheet` in the PrimeReact 11 port, and the change is the
 * whole shape of theming in v11 in one function. A v10 theme was a *file*: the question was which URL to
 * load, the answer was a string, and applying it meant swapping a `<link>`. A v11 theme is an *object*:
 * the question is which preset to hand `PrimeReactProvider`, the answer is a value, and applying it
 * means re-rendering a provider. Nothing is fetched, so there is no unstyled flash on switch and no way
 * for a theme to 404.
 *
 * The accent is bound by overriding the preset's `primary` scale with a primitive color ramp the preset
 * already ships - so `lara-light-teal` is genuinely Lara with Lara's own teal, not an approximation
 * mixed here.
 *
 * @param themeName The theme name, as it appears in {@link themePresets}.
 * @returns The preset, or `undefined` when this package ships no theme by that name. `undefined` rather
 * than a default preset, because silently theming a screen as something other than what was asked for is
 * harder to notice than nothing happening.
 */
export function primeReactThemePreset(themeName: string): PrimeReactPreset | undefined {
    const cached = presetCache.get(themeName);
    if (cached !== undefined) return cached;

    const preset = themePresets.find((candidate) => candidate.name === themeName);
    if (preset === undefined) return undefined;

    const base = basePresets[preset.family];

    // The ramp is looked up by name, so its type has to be widened to index the primitives and then
    // narrowed again for `definePreset`. `ColorScale` is the shape every primitive color in a preset has -
    // the 50..950 steps - and `primaryColor` is only ever one of those names, guaranteed by the catalog.
    const primitives = base.primitive as unknown as Record<string, Record<string, string>>;
    const ramp = primitives[preset.primaryColor];
    const built = definePreset(base, { semantic: { primary: ramp } }) as PrimeReactPreset;

    presetCache.set(themeName, built);
    return built;
}
