// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// What a navigation edit does. The values are shared with the TypeScript engine.
/// </summary>
public enum NavigationEditKind
{
    /// <summary>Sets how a module treats an outlet it inherits; inherits drops the module's refinement of it.</summary>
    SetOutletMode = 0,

    /// <summary>Replaces the items a level puts in an outlet itself.</summary>
    SetOutletItems = 1,

    /// <summary>Adds an item, or a sub-item, at a position among its siblings; after the ones already there when none is given.</summary>
    AddItem = 2,

    /// <summary>Replaces one of the items a level puts in an outlet itself, keeping its place.</summary>
    UpdateItem = 3,

    /// <summary>Moves one of the items a level puts in an outlet itself to another position or parent.</summary>
    MoveItem = 4,

    /// <summary>Removes one of the items a level puts in an outlet itself, with its sub-items.</summary>
    RemoveItem = 5,

    /// <summary>Hides an item a module inherits from the application.</summary>
    HideItem = 6,

    /// <summary>Sets the application logo.</summary>
    SetLogo = 7,
}
