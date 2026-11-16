// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';

// The package name is the library's identity: every stored icon reference holds it, so it must never change.
// The version follows the lucide-react release the bundle wraps; a spec fails when the two drift apart.
export const lucideLibraryName = 'Cratis.Icons.Lucide';

export const lucideManifest: ScenePackage = {
    name: lucideLibraryName,
    version: '1.71.0',
    kind: PackageKind.IconLibrary,
    dependencies: [],
    components: [],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
    displayName: 'Lucide',
    description: 'Clean, consistent outline icons for navigation, actions and status.',
    module: '@cratis/studio.editor/IconLibraries/Lucide',
    license: 'ISC',
    licenseUrl: 'https://lucide.dev/license',
    iconLibrary: {
        variants: [],
        renderers: ['react'],
        attribution: 'Icons by Lucide contributors',
        attributionUrl: 'https://lucide.dev',
        iconCount: 2046,
    },
};
