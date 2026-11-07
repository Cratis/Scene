// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletMode } from './OutletMode';
import type { OutletItem } from './OutletItem';

/**
 * How a lower level - a module, a feature, a slice or a screen - treats an outlet it inherits: Screenplay's
 * `outlet <name> inherits|extends|overrides` with `hide <id>` and its own items.
 */
export interface OutletRefinement {
    /** The name of the outlet refined. */
    outlet: string;

    /** How the inherited items are treated; extends when the refinement has items or hides, otherwise inherits. */
    mode?: OutletMode;

    /** This level's own items, in order. They go after the inherited ones unless they say `before` or `after`. */
    items?: OutletItem[];

    /** The ids of inherited items this level hides. */
    hide?: string[];
}

/** The own property names of {@link OutletRefinement}, checked against the shared shape manifest. */
export const OutletRefinementPropertyNames: (keyof OutletRefinement)[] = ['outlet', 'mode', 'items', 'hide'];
