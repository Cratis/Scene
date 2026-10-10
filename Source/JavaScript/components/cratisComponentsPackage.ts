// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { cratisComponentsDesignTime } from './designTime/cratisComponentsDesignTime';
import { cratisComponentsRuntimePackage } from './cratisComponentsRuntimePackage';

export { cratisComponentsPackageManifest } from './cratisComponentsPackageManifest';

/**
 * The `Cratis.Components` package as a loadable bundle - the manifest, the React components behind the names
 * it declares, and the design-time contributions a designer loads.
 *
 * A runtime host that must not load design-time code imports `cratisComponentsRuntimePackage` from
 * `@cratis/scene.components/runtime` instead; that entry reaches no designer, editor or action.
 */
export const cratisComponentsPackage: ScenePackageBundle = {
    ...cratisComponentsRuntimePackage,
    designTime: cratisComponentsDesignTime,
};
