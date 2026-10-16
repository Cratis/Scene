// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { administrationBlueprintManifest } from './manifest';
import { administrationScreens } from './screens';
import { administrationDialogTemplates, administrationScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const administrationBlueprint: ScenePackageBundle = {
    manifest: administrationBlueprintManifest,
    components: {},
    screenTemplates: administrationScreenTemplates,
    dialogTemplates: administrationDialogTemplates,
    screens: administrationScreens,
};
