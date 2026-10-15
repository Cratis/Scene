// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How a module's region relates to the application's items for the same region.
 */
export enum NavigationRegionMode {
    /** Effective items are the application items; the module's own items are cleared. */
    Inherit = 'inherit',

    /** Effective items are the application items followed by the module's items. */
    Extend = 'extend',

    /** Effective items are the module's items only. */
    Override = 'override',
}
