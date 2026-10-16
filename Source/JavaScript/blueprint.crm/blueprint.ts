// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { crmBlueprintManifest } from './manifest';
import { crmScreens } from './screens';
import { crmDialogTemplates, crmScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const crmBlueprint: ScenePackageBundle = {
    manifest: crmBlueprintManifest,
    components: {},
    screenTemplates: crmScreenTemplates,
    dialogTemplates: crmDialogTemplates,
    screens: crmScreens,
};
