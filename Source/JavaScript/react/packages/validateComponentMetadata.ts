// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateComponentDescriptors } from '@cratis/scene.engine';
import { SceneDiagnostic } from '@cratis/scene.model';
import { ScenePackageBundle, componentRegistryKey } from './ScenePackageBundle';

/**
 * Checks the component metadata of a bundle (rule CMP1): every component its manifest declares or its registry holds is described
 * and declares a category, and the design-mode and editor parameters of its descriptors are sound.
 *
 * This is not part of `validatePackageBundle`: that gates what a host loads, and a third-party package written before components
 * had categories must still load. A designer and the in-repo packages' own specs run this one.
 */
export function validateComponentMetadata(bundle: ScenePackageBundle): SceneDiagnostic[] {
    const registered = new Set([
        ...bundle.manifest.components.map(name => componentRegistryKey(bundle.manifest.name, name)),
        ...Object.keys(bundle.components),
    ]);

    return validateComponentDescriptors(bundle.descriptors ?? [], [...registered]);
}
