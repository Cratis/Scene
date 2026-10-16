// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { approvalsBlueprintManifest } from './manifest';
import { approvalsScreens } from './screens';
import { approvalsDialogTemplates, approvalsScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const approvalsBlueprint: ScenePackageBundle = {
    manifest: approvalsBlueprintManifest,
    components: {},
    screenTemplates: approvalsScreenTemplates,
    dialogTemplates: approvalsDialogTemplates,
    screens: approvalsScreens,
};
