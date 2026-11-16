// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { lucideAdapter } from './lucideAdapter';
import { lucideCatalog } from './lucideCatalog';
import { lucideManifest } from './lucideManifest';

export const lucidePackage: ScenePackageBundle = {
    manifest: lucideManifest,
    components: {},
    iconLibrary: { catalog: lucideCatalog, adapter: lucideAdapter },
};
