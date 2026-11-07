// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a navigation edit does. The values are shared with the C# engine.
 */
export enum NavigationEditKind {
    /** Sets how a module treats an outlet it inherits; `inherits` drops the module's refinement of it. */
    SetOutletMode = 'setOutletMode',

    /** Replaces the items a level puts in an outlet itself. */
    SetOutletItems = 'setOutletItems',

    /** Adds an item, or a sub-item, at a position among its siblings; after the ones already there when none is given. */
    AddItem = 'addItem',

    /** Replaces one of the items a level puts in an outlet itself, keeping its place. */
    UpdateItem = 'updateItem',

    /** Moves one of the items a level puts in an outlet itself to another position or parent. */
    MoveItem = 'moveItem',

    /** Removes one of the items a level puts in an outlet itself, with its sub-items. */
    RemoveItem = 'removeItem',

    /** Hides an item a module inherits from the application. */
    HideItem = 'hideItem',

    /** Sets the application logo. */
    SetLogo = 'setLogo',
}
