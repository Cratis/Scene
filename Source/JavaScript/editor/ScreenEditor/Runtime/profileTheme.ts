// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Theme } from '@cratis/scene.model';
import type { ScreenEditorRuntime } from './screenEditorRuntime';

// The theme the editor draws screens in. A host with a look of its own says so through the runtime's appearance, and that is the theme - on the
// surface and in Play alike. Otherwise it is the theme the runtime's UI profile names: the one Play applies to the screen, and so the one the surface applies too. A profile that
// names none, or one no package ships, gets the first theme a package offers, which is how Scene's own theme provider falls back.
export function profileTheme(runtime: Pick<ScreenEditorRuntime, 'bundles' | 'profile'> & Partial<Pick<ScreenEditorRuntime, 'appearance'>>): Theme | undefined {
    if (runtime.appearance) return runtime.appearance.theme;
    const themes = runtime.bundles.flatMap(bundle => bundle.themes ?? []);
    return themes.find(candidate => candidate.name === runtime.profile.theme) ?? themes[0];
}
