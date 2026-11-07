// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Outlet } from '../outlets/Outlet';
import { ApplicationLogo } from './ApplicationLogo';

/**
 * The application-level navigation: the outlets the application's shell layout declares, which every module inherits,
 * extends or overrides.
 *
 * A navigation region is an outlet of navigation named after the region (`topbar`, `sidebar`), a navigation
 * contribution point is an outlet of navigation named after the point (such as `Navigation`), and a region's
 * toolbar buttons are an outlet of actions named `<region>Buttons`. The shell always offers the `topbar` and
 * `sidebar` outlets of navigation and their `topbarButtons` and `sidebarButtons` outlets of actions; the application
 * declares only those it gives default items to.
 */
export interface ApplicationNavigation {
    /** The outlets the application declares, with their default items. */
    outlets: Outlet[];

    /** The application logo. */
    logo?: ApplicationLogo;
}

export const ApplicationNavigationPropertyNames: (keyof ApplicationNavigation)[] = ['outlets', 'logo'];
