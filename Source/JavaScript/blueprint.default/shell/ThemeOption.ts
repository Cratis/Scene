// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, Theme } from '@cratis/scene.model';
import { ColorScheme } from '../configuration';
import { readRecords, recordString } from './elementProperties';

/**
 * One entry a theme switcher offers.
 *
 * A switcher needs a name to record and a color scheme to record alongside it, but must not need the
 * theme's tokens - the tokens belong to whoever applies the theme, and a switcher that carried them would
 * force every page template to inline a full palette just to offer a choice.
 */
export interface ThemeOption {
    /** The {@link Theme.name} to record when this option is chosen. */
    name: string;

    /** What to show on the button. */
    label: string;

    /** Which side of the light/dark axis choosing this option puts the shell on. */
    colorScheme: ColorScheme;
}

/**
 * Reads the themes a switcher should offer out of an element's properties, falling back to the ones
 * supplied by the host.
 *
 * A template says which themes it wants offered; a host that renders the shell with a different theme set
 * passes those as the fallback. Neither has to know the other's list.
 *
 * @param element The element carrying an optional `themes` property - an array of `{ name, label, isDark }`.
 * @param fallback The options to offer when the element names none.
 * @returns The options to render.
 */
export function readThemeOptions(element: ExternalComponent, fallback: ThemeOption[]): ThemeOption[] {
    const declared = readRecords(element, 'themes').map(
        (record): ThemeOption => ({
            name: recordString(record, 'name'),
            label: recordString(record, 'label') || recordString(record, 'name'),
            colorScheme: record.isDark === true ? ColorScheme.Dark : ColorScheme.Light,
        }),
    );

    const named = declared.filter(option => option.name.length > 0);
    return named.length > 0 ? named : fallback;
}

/**
 * Turns the {@link Theme}s a package ships into switcher options, so a host offering its own themes and a
 * host offering this package's use the same code path.
 */
export function themeOptionsFor(themes: Theme[]): ThemeOption[] {
    return themes.map(theme => ({
        name: theme.name,
        label: theme.name,
        colorScheme: theme.isDark ? ColorScheme.Dark : ColorScheme.Light,
    }));
}
