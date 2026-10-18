// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScenePackageBundle } from '@cratis/scene.react';
import { bookingsBlueprintManifest } from './manifest';
import { bookingsScreens } from './screens';
import { bookingsDialogTemplates, bookingsScreenTemplates } from './templates';

/** This blueprint as a loadable bundle: the manifest names things, this provides them. It provides no component - every component is the foundation's. */
export const bookingsBlueprint: ScenePackageBundle = {
    manifest: bookingsBlueprintManifest,
    components: {},
    screenTemplates: bookingsScreenTemplates,
    dialogTemplates: bookingsDialogTemplates,
    screens: bookingsScreens,
};
