// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { PersistedUiProfile } from './PersistedUiProfile';
import { UiProfileSettings } from './UiProfileSettings';
import { resolveUiProfile } from './resolveUiProfile';

/**
 * Turns settings into what is stored: the choices plus the resolved package order and the shell's layout,
 * both computed by Scene's resolver at this moment.
 *
 * @param settings The settings to store.
 * @param bundles Every known package bundle.
 * @returns The {@link PersistedUiProfile}.
 */
export function persistedFromSettings(settings: UiProfileSettings, bundles: ScenePackageBundle[]): PersistedUiProfile {
    const resolved = resolveUiProfile(settings, bundles);

    return {
        packages: [...settings.packages],
        shell: settings.shell,
        templatePacks: [...settings.templatePacks],
        resolvedPackages: [...resolved.selection.packages],
        layout: resolved.layout,
        theme: settings.theme,
        colorScheme: settings.colorScheme,
        navigationMode: settings.navigationMode,
        accent: settings.accent,
        defaultScreenTemplate: settings.defaultScreenTemplate,
    };
}
