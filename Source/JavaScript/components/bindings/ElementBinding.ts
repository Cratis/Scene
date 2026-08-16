// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BoundConstructor } from './BoundConstructor';

/**
 * What a screen asked for at a binding site, and what the registry could actually produce for it.
 *
 * The name is kept even when nothing resolved, because the two failure modes an adapter has to
 * distinguish - "the screen named something that is not registered" and "the screen named nothing" -
 * are only tellable apart by whether a name is present.
 */
export interface ElementBinding {
    /** The name the screen wrote, or `undefined` when the screen set no binding property at all. */
    name?: string;

    /** The registered class, or `undefined` when nothing is registered under {@link name}. */
    target?: BoundConstructor;
}
