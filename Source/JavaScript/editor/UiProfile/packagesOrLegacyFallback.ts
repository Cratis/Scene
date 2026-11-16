// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScenePackageBundle } from '@cratis/scene.react';
import { blueprintPreviewBundles } from '../BlueprintPreview/blueprintPreviewCatalog';
import type { PersistedUiProfile } from './PersistedUiProfile';
import { defaultUiProfileSettings } from './defaultUiProfileSettings';
import { persistedFromSettings } from './persistedFromSettings';

export function packagesOrLegacyFallback(persisted: PersistedUiProfile, bundles: ScenePackageBundle[] = blueprintPreviewBundles): PersistedUiProfile {
    const hasSelection = [persisted.packages, persisted.templatePacks, persisted.resolvedPackages].some(packages => packages.length > 0);
    if (hasSelection) return persisted;

    // Matches ScreenplayUiProfile.DefaultPackages: an empty legacy selection still uses PrimeReact.
    const fallback = persistedFromSettings(defaultUiProfileSettings(bundles), bundles);
    return { ...persisted, packages: fallback.packages, templatePacks: fallback.templatePacks, resolvedPackages: fallback.resolvedPackages };
}
