// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { hrBlueprintManifest } from './manifest';
import { hrScreens } from './screens';
import { hrDialogTemplates, hrScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const hrBlueprint: ScenePackageBundle = {
    manifest: hrBlueprintManifest,
    components: {},
    screenTemplates: hrScreenTemplates,
    dialogTemplates: hrDialogTemplates,
    screens: hrScreens,
};
