// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { inventoryBlueprintManifest } from './manifest';
import { inventoryScreens } from './screens';
import { inventoryDialogTemplates, inventoryScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const inventoryBlueprint: ScenePackageBundle = {
    manifest: inventoryBlueprintManifest,
    components: {},
    screenTemplates: inventoryScreenTemplates,
    dialogTemplates: inventoryDialogTemplates,
    screens: inventoryScreens,
};
