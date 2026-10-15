// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a navigation edit does. The values are shared with the C# engine.
 */
export enum NavigationEditKind {
    /** Sets how a module's region relates to the application's. */
    SetRegionMode = 'setRegionMode',

    /** Replaces the items a level holds in a region. */
    SetRegionItems = 'setRegionItems',

    /** Adds an item, or a sub-item, after the ones already there. */
    AddItem = 'addItem',

    /** Sets the application logo. */
    SetLogo = 'setLogo',
}
