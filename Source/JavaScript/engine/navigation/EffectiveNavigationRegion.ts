// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind, OutletMode } from '@cratis/scene.model';
import { EffectiveNavButton } from './EffectiveNavButton';
import { EffectiveNavItem } from './EffectiveNavItem';
import { NavigationSources } from './NavigationSources';

/**
 * The items an outlet of navigation - a region such as the sidebar, or a contribution point such as `Navigation` -
 * effectively shows for the application or for one module, with where they came from.
 */
export interface EffectiveNavigationRegion {
    /** The name of the outlet of navigation: a {@link NavigationRegionKind} for a shell region, or a contribution point's name. */
    region: NavigationRegionKind | string;

    /** The module the outlet is resolved for; absent for the application itself. */
    module?: string;

    /** How the module treats the outlet: absent at the application level, which is the base. */
    mode?: OutletMode;

    /** Where the items come from, as the region tag shows it. */
    sources: NavigationSources;

    /** The items in the order they are shown. */
    items: EffectiveNavItem[];

    /** The buttons the outlet's outlet of actions (`<outlet>Buttons`) effectively shows, in the order they are shown. */
    buttons: EffectiveNavButton[];
}
