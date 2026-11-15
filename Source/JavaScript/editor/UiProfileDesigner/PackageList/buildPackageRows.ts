// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { PackageInclusion } from '../../UiProfile/PackageInclusion';
import type { ResolvedUiProfile } from '../../UiProfile/ResolvedUiProfile';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import { canMovePackage } from '../../UiProfile/movePackage';
import { packageGroupOf } from '../../UiProfile/packageGroupOf';
import type { PackageRow } from './PackageRow';

// The resolver lists packages lowest priority first (the last one wins); the designer lists the winner first, so the top of the list is the
// strongest and "up" means "wins more often". `priority` counts from the top.
export function buildPackageRows(settings: UiProfileSettings, resolved: ResolvedUiProfile, bundles: ScenePackageBundle[]): PackageRow[] {
    const manifests = new Map(bundles.map(bundle => [bundle.manifest.name, bundle.manifest]));
    return [...resolved.entries].reverse().map((entry, index) => {
        const chosen = settings.packages.includes(entry.name);
        return {
            name: entry.name,
            displayName: entry.displayName,
            version: entry.version,
            role: manifests.has(entry.name) ? packageGroupOf(manifests.get(entry.name)!)?.id : undefined,
            inclusion: entry.inclusion,
            requiredBy: entry.requiredBy,
            priority: index + 1,
            isPackage: chosen && entry.kind !== PackageKind.Blueprint,
            isShell: entry.name === settings.shell,
            isTemplatePack: settings.templatePacks.includes(entry.name),
            // Raising a package is moving it later in the resolver's order.
            canRaise: chosen && entry.inclusion === PackageInclusion.Explicit && canMovePackage(settings, entry.name, 1, bundles),
            canLower: chosen && entry.inclusion === PackageInclusion.Explicit && canMovePackage(settings, entry.name, -1, bundles),
        };
    });
}
