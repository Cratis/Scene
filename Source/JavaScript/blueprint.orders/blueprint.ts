// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { ordersBlueprintManifest } from './manifest';
import { ordersScreens } from './screens';
import { ordersDialogTemplates, ordersScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const ordersBlueprint: ScenePackageBundle = {
    manifest: ordersBlueprintManifest,
    components: {},
    screenTemplates: ordersScreenTemplates,
    dialogTemplates: ordersDialogTemplates,
    screens: ordersScreens,
};
