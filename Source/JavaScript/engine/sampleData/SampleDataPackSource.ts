// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPack, ScenePackage } from '@cratis/scene.model';

/**
 * A package and the sample-data packs it ships, loaded. A React `ScenePackageBundle` already has the manifest;
 * hosts add the loaded packs the manifest's `sampleData` references point to.
 */
export interface SampleDataPackSource {
    manifest: ScenePackage;
    packs?: SampleDataPack[];
}
