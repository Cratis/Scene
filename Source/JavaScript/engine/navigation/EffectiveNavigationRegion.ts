// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { EffectiveNavButton } from './EffectiveNavButton';
import { EffectiveNavItem } from './EffectiveNavItem';
import { NavigationSources } from './NavigationSources';

/**
 * The items a region effectively shows for the application or for one module, with where they came from.
 */
export interface EffectiveNavigationRegion {
    /** Which region this is. */
    region: NavigationRegionKind;

    /** The module the region is resolved for; absent for the application itself. */
    module?: string;

    /** The effective mode: absent at the application level, which is the base. */
    mode?: NavigationRegionMode;

    /** Where the items come from, as the region tag shows it. */
    sources: NavigationSources;

    /** The items in the order they are shown. */
    items: EffectiveNavItem[];

    /**
     * The application-level toolbar buttons the region effectively shows, in the order they are shown; the mode applies
     * to them as it does to the items.
     */
    buttons: EffectiveNavButton[];
}
