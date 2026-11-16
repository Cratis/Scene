// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { UiProfileSettings } from './UiProfileSettings';
import { resolveUiProfile } from './resolveUiProfile';

/**
 * Keeps the theme valid for the packages: the chosen theme stays when the profile can still use it,
 * otherwise the first compatible theme of the same brightness takes its place, then any compatible one,
 * then none.
 *
 * @param settings The settings to check.
 * @param bundles Every known package bundle.
 * @returns The settings with a theme the profile can pick.
 */
export function withCompatibleTheme(settings: UiProfileSettings, bundles: ScenePackageBundle[]): UiProfileSettings {
    const { compatibleThemes } = resolveUiProfile(settings, bundles);
    if (compatibleThemes.some(theme => theme.name === settings.theme)) return settings;

    const wantsDark = settings.colorScheme === 'dark';
    const replacement = compatibleThemes.find(theme => Boolean(theme.isDark) === wantsDark) ?? compatibleThemes[0];
    return { ...settings, theme: replacement?.name ?? '' };
}
