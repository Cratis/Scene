// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiProfile } from '@cratis/scene.model';
import { isThemeCompatible } from '@cratis/scene.engine';

/**
 * Filters a theme list down to the ones a {@link UiProfile} can actually pick - part of StudioIssues#160's
 * theme picker, filtered by the active profile's package list. Reuses `isThemeCompatible` (Cratis/Scene#5)
 * unmodified as the filter predicate, per the issue's own wording ("reusing the exact compiler
 * compatibility check as the filter logic rather than duplicating it").
 *
 * @param profile The active {@link UiProfile}.
 * @param themes Every known {@link Theme}.
 * @returns Only the themes declared compatible with every package `profile` lists.
 */
export function filterCompatibleThemes(profile: UiProfile, themes: Theme[]): Theme[] {
    return themes.filter(theme => isThemeCompatible(theme, profile));
}
