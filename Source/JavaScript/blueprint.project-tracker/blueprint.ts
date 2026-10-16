// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { projectTrackerBlueprintManifest } from './manifest';
import { projectTrackerScreens } from './screens';
import { projectTrackerDialogTemplates, projectTrackerScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const projectTrackerBlueprint: ScenePackageBundle = {
    manifest: projectTrackerBlueprintManifest,
    components: {},
    screenTemplates: projectTrackerScreenTemplates,
    dialogTemplates: projectTrackerDialogTemplates,
    screens: projectTrackerScreens,
};
