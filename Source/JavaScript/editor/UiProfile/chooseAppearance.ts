// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme } from '@cratis/scene.blueprint.default';
import { ScenePackageBundle } from '@cratis/scene.react';
import { UiProfileSettings } from './UiProfileSettings';
import { resolveUiProfile } from './resolveUiProfile';

/**
 * Chooses a theme, and moves the color scheme with it so the two never disagree.
 *
 * @param settings The current settings.
 * @param themeName The theme to use.
 * @param bundles Every known package bundle.
 * @returns The settings with that theme and its brightness, or unchanged when the profile cannot use it.
 */
export function chooseTheme(settings: UiProfileSettings, themeName: string, bundles: ScenePackageBundle[]): UiProfileSettings {
    const theme = resolveUiProfile(settings, bundles).compatibleThemes.find(candidate => candidate.name === themeName);
    return theme ? { ...settings, theme: theme.name, colorScheme: theme.isDark ? ColorScheme.Dark : ColorScheme.Light } : settings;
}

/**
 * Chooses light or dark and, when the current theme is the other brightness, switches to the first
 * compatible theme of the requested one.
 *
 * @param settings The current settings.
 * @param colorScheme The brightness to use.
 * @param bundles Every known package bundle.
 * @returns The updated settings. When no compatible theme has that brightness the theme is kept.
 */
export function chooseColorScheme(settings: UiProfileSettings, colorScheme: ColorScheme, bundles: ScenePackageBundle[]): UiProfileSettings {
    const themes = resolveUiProfile(settings, bundles).compatibleThemes;
    const wantsDark = colorScheme === ColorScheme.Dark;
    const current = themes.find(theme => theme.name === settings.theme);
    if (current && Boolean(current.isDark) === wantsDark) return { ...settings, colorScheme };

    const replacement = themes.find(theme => Boolean(theme.isDark) === wantsDark);
    return { ...settings, colorScheme, theme: replacement?.name ?? settings.theme };
}
