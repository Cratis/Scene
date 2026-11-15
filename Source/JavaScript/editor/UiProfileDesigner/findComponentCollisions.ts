// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ComponentResolution, PackageCatalog, resolveComponentName } from '@cratis/scene.engine';

/**
 * Finds every bare component name that more than one of a {@link UiProfile}'s active packages declares -
 * part of StudioIssues#160's "component name collision surfacing", so the designer can flag which package
 * currently wins by priority rather than only warning at build time. Reuses `resolveComponentName`
 * (Cratis/Scene#3) unmodified for every catalog name - a collision is exactly a resolution whose
 * `shadows` isn't empty, so no separate collision-detection algorithm exists to drift from resolution
 * itself.
 *
 * @param profile The {@link UiProfile} to check.
 * @param catalog Every active package's declared component names, keyed by package name.
 * @returns The {@link ComponentResolution} for every bare name declared by more than one active package, sorted by name.
 */
export function findComponentCollisions(profile: UiProfile, catalog: PackageCatalog): ComponentResolution[] {
    const names = new Set(Object.values(catalog).flat());

    return [...names]
        .map(name => resolveComponentName(name, profile, catalog))
        .filter((resolution): resolution is ComponentResolution => resolution !== undefined && resolution.shadows.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));
}
