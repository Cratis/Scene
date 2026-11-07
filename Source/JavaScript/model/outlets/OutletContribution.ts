// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletItem } from './OutletItem';

/**
 * Items a module or feature adds to an outlet without overriding it: Screenplay's `contribute to <outlet>`. Any level
 * can contribute, including one outside the chain of the screen the outlet shows on.
 */
export interface OutletContribution {
    /** The name of the outlet contributed to. */
    outlet: string;

    /** The contributed items, in order. They go last unless they say `before` or `after`. */
    items: OutletItem[];
}

/** The own property names of {@link OutletContribution}, checked against the shared shape manifest. */
export const OutletContributionPropertyNames: (keyof OutletContribution)[] = ['outlet', 'items'];
