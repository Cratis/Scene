// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, ScreenFit } from '@cratis/scene.model';
import { PlacementInput } from './PlacementInput';
import { PlacementSlot } from './PlacementSlot';

/**
 * What placement needs to work out where an action's slice opens: what the action asks for, what the slice's screen fits,
 * where the inputs come from, and the slots the page has.
 */
export interface PlacementRequest {
    /** The qualified id of the slice the action runs, such as `Catalog.Products.SetProductPrice`. */
    slice: string;

    /** Where the action asks the screen to open; automatic when absent. */
    opens?: Opens;

    /** The slot the action names, when it opens in a slot. */
    opensIn?: string;

    /** The name of the slice's screen; absent when the slice has none, so it can only run directly. */
    screen?: string;

    /** The places the screen fits, in order of preference; absent or empty fits a dialog. */
    fits?: ScreenFit[];

    /** The command's inputs and where each gets its value. */
    inputs: PlacementInput[];

    /** The slots of the page the action sits on, in the order the page declares them. */
    slots: PlacementSlot[];

    /** The values of the page's route parameters, used to show the URL a routed slot produces. */
    routeValues?: Record<string, string>;
}
