// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletLevel } from './OutletLevel';

/** The levels an outlet of a screen resolves through, and the levels outside them that contribute to it. */
export interface OutletChain {
    /** The levels from the top down: the application, the layout, the screen template, each module and feature of the screen's path, then the screen. */
    chain: OutletLevel[];

    /** The levels outside the chain that contribute: other screens, other modules and the host's levels not on the screen's path. */
    contributors: OutletLevel[];
}
