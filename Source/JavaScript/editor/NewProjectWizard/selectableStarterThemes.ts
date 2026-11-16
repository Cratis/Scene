// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiStarter } from '@cratis/scene.model';
import { incompatibleStarterThemes } from '@cratis/scene.engine';

/**
 * The themes a {@link UiStarter}'s gallery theme switcher can actually offer - part of
 * StudioIssues#162's "theme switcher scoped to the starter's compatible themes". Reuses
 * `incompatibleStarterThemes` (Cratis/Scene#6) unmodified and returns its complement resolved to full
 * {@link Theme} objects, rather than re-deriving compatibility here.
 *
 * @param starter The {@link UiStarter} being previewed.
 * @param themes Every known {@link Theme}, keyed by name.
 * @returns The {@link Theme}s in `starter.themes` that are compatible with `starter.packages`.
 */
export function selectableStarterThemes(starter: UiStarter, themes: Record<string, Theme>): Theme[] {
    const incompatible = new Set(incompatibleStarterThemes(starter, themes));

    return starter.themes
        .filter(name => !incompatible.has(name))
        .map(name => themes[name])
        .filter((theme): theme is Theme => theme !== undefined);
}
