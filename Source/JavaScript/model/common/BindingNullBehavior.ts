// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a binding target does when its source resolves to null or undefined.
 */
export enum BindingNullBehavior {
    /** Propagate null to the target. */
    Propagate = 'propagate',

    /** Clear the target to its empty state. */
    Clear = 'clear',

    /** Leave the target's current value unchanged. */
    Preserve = 'preserve',
}
