// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Why an inherited item is not among an outlet's resolved items.
 */
export enum OutletRemoval {
    /** A lower level hid it. */
    Hidden = 'hidden',

    /** A lower level overrode the outlet. */
    Overridden = 'overridden',
}
