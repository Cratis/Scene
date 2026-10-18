// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { vendorsBlueprintManifest } from './manifest';
import { vendorsScreens } from './screens';
import { vendorsDialogTemplates, vendorsScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const vendorsBlueprint: ScenePackageBundle = {
    manifest: vendorsBlueprintManifest,
    components: {},
    screenTemplates: vendorsScreenTemplates,
    dialogTemplates: vendorsDialogTemplates,
    screens: vendorsScreens,
};
