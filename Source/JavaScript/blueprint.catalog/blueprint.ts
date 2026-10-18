// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { catalogBlueprintManifest } from './manifest';
import { catalogScreens } from './screens';
import { catalogDialogTemplates, catalogScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const catalogBlueprint: ScenePackageBundle = {
    manifest: catalogBlueprintManifest,
    components: {},
    screenTemplates: catalogScreenTemplates,
    dialogTemplates: catalogDialogTemplates,
    screens: catalogScreens,
};
