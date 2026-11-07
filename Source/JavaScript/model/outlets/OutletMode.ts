// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How a lower level treats the items of an outlet it inherits.
 */
export enum OutletMode {
    /** Keep the inherited items unchanged. */
    Inherits = 'inherits',

    /** Keep the inherited items, minus the hidden ones, and add this level's after them. */
    Extends = 'extends',

    /** Replace the inherited items with this level's. */
    Overrides = 'overrides',
}
