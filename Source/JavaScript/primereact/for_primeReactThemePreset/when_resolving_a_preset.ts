// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactThemeNames, primeReactThemePreset } from '../theme';

describe('when resolving a preset', () => {
    describe('and the theme is one this package ships', () => {
        it('should resolve a preset for every theme in the catalog', () => {
            primeReactThemeNames.filter((name) => primeReactThemePreset(name) === undefined).should.deep.equal([]);
        });

        it('should bind the theme accent onto the preset primary scale', () => {
            const preset = primeReactThemePreset('lara-light-blue')!;
            (preset.semantic!.primary as Record<string, string>)['500'].should.equal('#3b82f6');
        });

        it('should bind a different accent for a differently tinted theme of the same family', () => {
            const preset = primeReactThemePreset('lara-light-teal')!;
            (preset.semantic!.primary as Record<string, string>)['500'].should.equal('#14b8a6');
        });

        /**
         * `definePreset` deep-merges into a *new* object, but the base presets are module singletons.
         * A merge that mutated its base would leave whichever theme resolved first tinting every later
         * one - a bug that only appears once two themes of a family are used in the same session, which
         * is exactly what a theme picker does.
         */
        it('should not tint one theme with another theme of the same family', () => {
            primeReactThemePreset('lara-light-purple');
            const blue = primeReactThemePreset('lara-light-blue')!;
            (blue.semantic!.primary as Record<string, string>)['500'].should.equal('#3b82f6');
        });

        /**
         * `PrimeReactProvider` treats a new preset identity as a theme change and re-emits every `--p-*`
         * custom property, so handing it a freshly built object each render would repaint the page on
         * every render.
         */
        it('should return the same preset instance for the same theme, so a re-render is not a theme change', () => {
            primeReactThemePreset('aura-dark-indigo')!.should.equal(primeReactThemePreset('aura-dark-indigo')!);
        });
    });

    describe('and the theme is unknown', () => {
        it('should resolve nothing rather than a default that would silently theme a screen wrongly', () => {
            (primeReactThemePreset('lara-light-chartreuse') === undefined).should.be.true;
        });
    });
});
