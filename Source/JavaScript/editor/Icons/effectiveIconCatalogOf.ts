// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveIconCatalog, resolveIconLibraries } from '@cratis/scene.engine';
import { ScenePackageBundle } from '@cratis/scene.react';
import { iconCatalogSourcesOf } from './iconCatalogSourcesOf';

// Opens the effective icon catalog of a package selection: the icon libraries it names or its other
// packages depend on, resolved by Scene, with the catalogs the bundles ship.
//
// Nothing is loaded here. A library's catalog is read the first time something asks for it, so building
// one for every draft of the UI Profile stays cheap.
export function effectiveIconCatalogOf(packages: string[], bundles: ScenePackageBundle[]): EffectiveIconCatalog {
    const resolution = resolveIconLibraries(packages, bundles.map(bundle => bundle.manifest));
    return new EffectiveIconCatalog(resolution, iconCatalogSourcesOf(bundles));
}
