// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel } from '@cratis/scene.model';
import { ApplicationStructureIndex, EffectiveNavItem } from '@cratis/scene.engine';

/**
 * What a navigation region needs to resolve the items it shows: the application's structure and its navigation, and
 * the two hooks a host plugs.
 */
export interface SceneNavigationModel {
    /** The modules, features and slices of the application. */
    structure: ApplicationStructure | ApplicationStructureIndex;

    /** The application and module navigation regions. */
    navigation: NavigationModel;

    /**
     * The name of the screen an item opens. Defaults to the qualified id of the feature the item resolves to
     * (`sales.orders`), which is how `ApplicationStructure` names a feature's screen.
     */
    screenFor?(item: EffectiveNavItem): string | undefined;

    /**
     * Whether an item is shown. An item for which this answers false is hidden, not disabled - Stage plugs permissions
     * here. Applies to every level of a hierarchical region; hiding a parent hides its children.
     */
    isVisible?(item: EffectiveNavItem): boolean;
}
