// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateMetadata } from '@cratis/scene.model';

/**
 * The compatibility, attribution and license metadata every template this blueprint ships carries.
 *
 * Templates are written against the Scene model that introduced template provenance, against the default
 * blueprint whose shell and slots they fill, and against the Cratis Components composites they are built from -
 * the same dependencies the manifest declares. `describeTemplateCatalog` checks every template against them,
 * and this package's specs prove each one comes out compatible.
 */
export const componentsBlueprintTemplateProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    compatibility: {
        scene: '^4.13.0',
        packages: [
            { name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' },
            { name: 'Cratis.Components', versionRange: '^3.0.0' },
        ],
    },
    attribution: { author: 'Cratis', url: 'https://github.com/Cratis/Scene/tree/main/Source/JavaScript/blueprint.components' },
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
};
