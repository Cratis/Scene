// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationLogo } from './ApplicationLogo';
import { NavigationRegion } from './NavigationRegion';

/**
 * The application-level navigation: the base every module inherits, extends or overrides.
 */
export interface ApplicationNavigation {
    /** The regions the application defines items for. */
    regions: NavigationRegion[];

    /** The application logo. */
    logo?: ApplicationLogo;
}

export const ApplicationNavigationPropertyNames: (keyof ApplicationNavigation)[] = ['regions', 'logo'];
