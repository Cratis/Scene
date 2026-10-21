// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateMetadata } from '@cratis/scene.model';

/**
 * The compatibility, attribution and license of the optional widget-borrowing gallery templates.
 * These packages are requirements of those templates, not of the shell. A host opts into them in its
 * profile; a default-only profile offers the foundation templates and reports these as incompatible.
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

/** The shell requires only the component library its controls use, not the gallery's optional widgets. */
export const defaultBlueprintShellProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    ...defaultBlueprintTemplateProvenance,
    compatibility: {
        scene: defaultBlueprintTemplateProvenance.compatibility!.scene,
        packages: [{ name: 'Cratis.Components', versionRange: '^3.0.0' }],
    },
};

/** The shell follows the Sakai arrangement without depending on its widget library. */
export const sakaiShellProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    ...defaultBlueprintShellProvenance,
    attribution: sakaiCompositionProvenance.attribution,
};
