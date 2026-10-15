// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// What a navigation edit does. The camel-cased names are shared with the TypeScript engine.
/// </summary>
public enum NavigationEditKind
{
    /// <summary>Sets how a module's region relates to the application's.</summary>
    SetRegionMode = 0,

    /// <summary>Replaces the items a level holds in a region.</summary>
    SetRegionItems = 1,

    /// <summary>Adds an item, or a sub-item, after the ones already there.</summary>
    AddItem = 2,

    /// <summary>Sets the application logo.</summary>
    SetLogo = 3,
}
