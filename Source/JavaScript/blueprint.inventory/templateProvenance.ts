// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateMetadata } from '@cratis/scene.model';

/** The compatibility, attribution and license metadata every template this blueprint ships carries. */
export const inventoryTemplateProvenance: Pick<TemplateMetadata, 'compatibility' | 'attribution' | 'license' | 'licenseUrl'> = {
    compatibility: {
        scene: '^4.13.0',
        packages: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    },
    attribution: { author: 'Cratis', url: 'https://github.com/Cratis/Scene/tree/main/Source/JavaScript/blueprint.inventory' },
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
};
