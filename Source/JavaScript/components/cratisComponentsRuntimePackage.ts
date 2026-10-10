// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { cratisComponents } from './cratisComponents';
import { cratisComponentsDescriptors } from './cratisComponentsDescriptors';
import { cratisComponentsPackageManifest } from './cratisComponentsPackageManifest';

/**
 * The `Cratis.Components` package without design-time contributions: the manifest, the components and their
 * descriptors. The manifest still names the design-time extensions - that is data a host reads without
 * loading them - but no designer, editor or action module is reachable from this bundle, which is what a
 * runtime host imports from `@cratis/scene.components/runtime`.
 *
 * No `layouts`, `screenTemplates`, `dialogTemplates` or `themes` are provided, matching a manifest that
 * declares none of them; `validatePackageBundle` is what proves the two halves agree.
 */
export const cratisComponentsRuntimePackage: ScenePackageBundle = {
    manifest: cratisComponentsPackageManifest,
    components: cratisComponents,
    descriptors: cratisComponentsDescriptors,
};
