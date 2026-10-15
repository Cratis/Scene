// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationNavigation } from './ApplicationNavigation';
import { ModuleNavigation } from './ModuleNavigation';

/**
 * All the navigation an application declares: its own regions and the regions each module changes.
 */
export interface NavigationModel {
    /** The application-level navigation. */
    application: ApplicationNavigation;

    /** The per-module navigation; a module that is not listed inherits everything. */
    modules: ModuleNavigation[];
}

export const NavigationModelPropertyNames: (keyof NavigationModel)[] = ['application', 'modules'];
