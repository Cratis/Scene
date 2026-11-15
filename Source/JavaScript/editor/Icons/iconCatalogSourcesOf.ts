// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconCatalogSource } from '@cratis/scene.engine';
import { ScenePackageBundle } from '@cratis/scene.react';

// The icon catalogs the given bundles ship, one per icon-library bundle.
export function iconCatalogSourcesOf(bundles: ScenePackageBundle[]): IconCatalogSource[] {
    return bundles.flatMap(bundle => (bundle.iconLibrary ? [bundle.iconLibrary.catalog] : []));
}
