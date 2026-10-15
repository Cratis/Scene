// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegion } from './NavigationRegion';

/**
 * The navigation a module declares for the regions it changes. A region it does not declare inherits the application's.
 */
export interface ModuleNavigation {
    /** The module identity. */
    module: string;

    /** The regions the module changes. */
    regions: NavigationRegion[];
}

export const ModuleNavigationPropertyNames: (keyof ModuleNavigation)[] = ['module', 'regions'];
