// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { workOrdersBlueprintManifest } from './manifest';
import { workOrdersScreens } from './screens';
import { workOrdersDialogTemplates, workOrdersScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const workOrdersBlueprint: ScenePackageBundle = {
    manifest: workOrdersBlueprintManifest,
    components: {},
    screenTemplates: workOrdersScreenTemplates,
    dialogTemplates: workOrdersDialogTemplates,
    screens: workOrdersScreens,
};
