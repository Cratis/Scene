// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { ScenePackageBundle } from '@cratis/scene.react';

// A component library that depends on the Acme.Icons icon library within the given version range.
export function aLibraryNeedingIcons(range: string): ScenePackageBundle {
    return {
        manifest: {
            name: 'Needy',
            version: '1.0.0',
            kind: PackageKind.ComponentLibrary,
            dependencies: [{ name: 'core' }, { name: 'Acme.Icons', versionRange: range }],
            components: [],
            layouts: [],
            screenTemplates: [],
            dialogTemplates: [],
            themes: [],
        },
        components: {},
    };
}
