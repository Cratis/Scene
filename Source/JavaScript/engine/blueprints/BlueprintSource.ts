// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPack, Screen } from '@cratis/scene.model';
import { TemplateSource } from '../templates/TemplateSource';

/**
 * A blueprint package as the verification and the catalog read it: its manifest and the layouts and templates it provides (as a
 * {@link TemplateSource}), plus what a manifest only names - the screens of its screen set, the sample-data packs its references point
 * to, and the package's files. A React `ScenePackageBundle` already has most of this, so hosts pass their bundles straight in.
 */
export interface BlueprintSource extends TemplateSource {
    /** The screens the package provides. When given, every screen of the screen set must be among them. */
    screens?: Screen[];

    /** The sample-data packs the manifest's references point to, loaded. */
    packs?: SampleDataPack[];

    /**
     * The package-relative paths of the files the package contains (`thumbnails/crm.svg`, `sampleData/crm.en.json`). When given, the
     * thumbnails and sample-data files the manifest names must be among them.
     */
    files?: string[];
}
