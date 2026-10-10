// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';

/** The name of the fixture's styling package. */
export const brandPackageName = 'Acme.Brand';

/**
 * A styling package the inspections package depends on: no components, one stylesheet, one font, and the
 * one runtime singleton it owns. Together with `Acme.Inspections` it is a custom package set a host
 * approves as a unit.
 */
export const brandPackage: ScenePackageBundle = {
    manifest: {
        name: brandPackageName,
        version: '1.2.0',
        kind: PackageKind.Styling,
        dependencies: [],
        components: [],
        layouts: [],
        screenTemplates: [],
        dialogTemplates: [],
        themes: [],
        displayName: 'Acme Brand',
        license: 'Apache-2.0',
        assets: ['styles/acme-brand.css', 'fonts/acme-sans.woff2'],
        runtimeSingletons: ['@acme/brand-tokens'],
    },
    components: {},
};
