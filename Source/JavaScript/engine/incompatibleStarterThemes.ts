// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiProfile, UiStarter } from '@cratis/scene.model';
import { incompatiblePackages } from './themeCompatibility';

/**
 * Finds the {@link UiStarter.themes} that are not compatible with the starter's own {@link UiStarter.packages} -
 * part of Cratis/Scene#6. A starter is versioned per package combination it targets, so a theme it ships
 * as a choice that turns out incompatible with the starter's own packages is exactly the gap
 * `themeCompatibility` already surfaces for a {@link UiProfile}; this reuses that rule rather than
 * reimplementing it for starters.
 *
 * @param starter The {@link UiStarter} to check.
 * @param themes Every known {@link Theme}, keyed by name.
 * @returns The names in `starter.themes` that are either unknown to `themes` or incompatible with `starter.packages`.
 */
export function incompatibleStarterThemes(starter: UiStarter, themes: Record<string, Theme>): string[] {
    const profile: UiProfile = { name: starter.name, targetPlatform: '', packages: starter.packages };
    return starter.themes.filter(name => {
        const theme = themes[name];
        return !theme || incompatiblePackages(theme, profile).length > 0;
    });
}
