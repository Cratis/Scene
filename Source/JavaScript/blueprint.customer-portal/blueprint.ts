// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { customerPortalBlueprintManifest } from './manifest';
import { customerPortalScreens } from './screens';
import { customerPortalDialogTemplates, customerPortalScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const customerPortalBlueprint: ScenePackageBundle = {
    manifest: customerPortalBlueprintManifest,
    components: {},
    screenTemplates: customerPortalScreenTemplates,
    dialogTemplates: customerPortalDialogTemplates,
    screens: customerPortalScreens,
};
