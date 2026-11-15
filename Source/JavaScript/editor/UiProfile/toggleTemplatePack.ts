// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';
import { PackageEditKind } from './PackageEditKind';
import { PackageEditOutcome } from './PackageEditOutcome';
import { UiProfileSettings } from './UiProfileSettings';
import { resolveUiProfile } from './resolveUiProfile';
import { withCompatibleTheme } from './withCompatibleTheme';

/**
 * Adds or removes a blueprint whose reusable templates join the profile without changing the shell.
 *
 * The shell itself cannot be a template pack - it already contributes its templates. Removing a pack that
 * another package still requires leaves it in as an automatic inclusion, exactly as for libraries.
 *
 * @param settings The current settings.
 * @param name The blueprint to add or remove.
 * @param bundles Every known package bundle.
 * @returns The {@link PackageEditOutcome}.
 */
export function toggleTemplatePack(settings: UiProfileSettings, name: string, bundles: ScenePackageBundle[]): PackageEditOutcome {
    const manifest = bundles.find(bundle => bundle.manifest.name === name)?.manifest;
    if (!manifest || manifest.kind !== PackageKind.Blueprint) return { settings, kind: PackageEditKind.Unchanged, requiredBy: [] };
    if (name === settings.shell) return { settings, kind: PackageEditKind.Blocked, requiredBy: [name] };

    if (!settings.templatePacks.includes(name)) {
        return {
            settings: withCompatibleTheme({ ...settings, templatePacks: [...settings.templatePacks, name] }, bundles),
            kind: PackageEditKind.Added,
            requiredBy: [],
        };
    }

    const next = withCompatibleTheme({ ...settings, templatePacks: settings.templatePacks.filter(candidate => candidate !== name) }, bundles);
    const remaining = resolveUiProfile(next, bundles).entries.find(entry => entry.name === name);
    return remaining
        ? { settings: next, kind: PackageEditKind.RemovedButStillRequired, requiredBy: remaining.requiredBy }
        : { settings: next, kind: PackageEditKind.Removed, requiredBy: [] };
}
