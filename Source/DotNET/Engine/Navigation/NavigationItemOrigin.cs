// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Which level defined a navigation item.
/// </summary>
public enum NavigationItemOrigin
{
    /// <summary>The application defined the item.</summary>
    Application = 0,

    /// <summary>A module defined the item.</summary>
    Module = 1,
}
