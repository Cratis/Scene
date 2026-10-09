// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateMetadata } from '@cratis/scene.model';

/**
 * The compatibility, attribution and license metadata every template this blueprint ships carries.
 *
 * Templates are written against the Scene model that introduced template provenance, and against the
 * PrimeReact and Cratis Components packages this blueprint depends on - the same dependencies its manifest
 * declares, with the ranges the templates were verified against. `describeTemplateCatalog` checks every
 * template against them, and this package's specs prove each one comes out compatible.
 */
export const defaultBlueprintTemplateProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    compatibility: {
        scene: '^4.13.0',
        packages: [
            { name: 'PrimeReact', versionRange: '^11.0.0' },
            { name: 'Cratis.Components', versionRange: '^3.0.0' },
        ],
    },
    attribution: { author: 'Cratis', url: 'https://github.com/Cratis/Scene/tree/main/Source/JavaScript/blueprint.default' },
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
};

/**
 * The provenance of the shell and the dashboard, whose arrangement follows PrimeTek's free Sakai template.
 * The arrangement is followed; no Sakai source or asset is part of this package.
 */
export const sakaiCompositionProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    ...defaultBlueprintTemplateProvenance,
    attribution: {
        ...defaultBlueprintTemplateProvenance.attribution!,
        notice: "Arrangement follows PrimeTek's Sakai React template (https://github.com/primefaces/sakai-react, MIT).",
    },
};
