// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { contractsBlueprintManifest } from './manifest';
import { contractsScreens } from './screens';
import { contractsDialogTemplates, contractsScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const contractsBlueprint: ScenePackageBundle = {
    manifest: contractsBlueprintManifest,
    components: {},
    screenTemplates: contractsScreenTemplates,
    dialogTemplates: contractsDialogTemplates,
    screens: contractsScreens,
};
