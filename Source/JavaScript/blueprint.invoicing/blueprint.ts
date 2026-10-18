// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { invoicingBlueprintManifest } from './manifest';
import { invoicingScreens } from './screens';
import { invoicingDialogTemplates, invoicingScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const invoicingBlueprint: ScenePackageBundle = {
    manifest: invoicingBlueprintManifest,
    components: {},
    screenTemplates: invoicingScreenTemplates,
    dialogTemplates: invoicingDialogTemplates,
    screens: invoicingScreens,
};
