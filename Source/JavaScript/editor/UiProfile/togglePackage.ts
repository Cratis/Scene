// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.engine';
import { ScenePackageBundle } from '@cratis/scene.react';
import { PackageEditKind } from './PackageEditKind';
import { PackageEditOutcome } from './PackageEditOutcome';
import { PackageInclusion } from './PackageInclusion';
import { UiProfileSettings } from './UiProfileSettings';
import { resolveUiProfile } from './resolveUiProfile';
import { withCompatibleTheme } from './withCompatibleTheme';

/**
 * Adds or removes one component library, styling package or other non-blueprint package.
 *
 * Removal is protected rather than forbidden. Taking out something you chose that another package needs
 * leaves it in the profile as an automatic inclusion, and says so; trying to remove something you never
 * chose, which is only there because of a requirement, is blocked and names what requires it. Whatever was
 * only there for the removed package drops out on its own, because the resolver is re-run on the result.
 *
 * Blueprints are chosen through {@link setShell} and {@link toggleTemplatePack} instead.
 *
 * @param settings The current settings.
 * @param name The package to add or remove.
 * @param bundles Every known package bundle.
 * @returns The {@link PackageEditOutcome}.
 */
export function togglePackage(settings: UiProfileSettings, name: string, bundles: ScenePackageBundle[]): PackageEditOutcome {
    const manifest = bundles.find(bundle => bundle.manifest.name === name)?.manifest;
    const unchanged: PackageEditOutcome = { settings, kind: PackageEditKind.Unchanged, requiredBy: [] };
    if (!manifest || manifest.kind === PackageKind.Blueprint) return unchanged;
    if (name === corePackage) return { ...unchanged, kind: PackageEditKind.Blocked };

    if (settings.packages.includes(name)) {
        const next = withCompatibleTheme({ ...settings, packages: settings.packages.filter(candidate => candidate !== name) }, bundles);
        const remaining = resolveUiProfile(next, bundles).entries.find(entry => entry.name === name);
        return remaining
            ? { settings: next, kind: PackageEditKind.RemovedButStillRequired, requiredBy: remaining.requiredBy }
            : { settings: next, kind: PackageEditKind.Removed, requiredBy: [] };
    }

    const present = resolveUiProfile(settings, bundles).entries.find(entry => entry.name === name);
    if (present?.inclusion === PackageInclusion.Automatic) {
        return { settings, kind: PackageEditKind.Blocked, requiredBy: present.requiredBy };
    }

    return {
        settings: withCompatibleTheme({ ...settings, packages: [...settings.packages, name] }, bundles),
        kind: PackageEditKind.Added,
        requiredBy: [],
    };
}
