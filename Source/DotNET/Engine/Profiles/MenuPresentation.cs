// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// How a navigation mode presents the menu on a pointer device.
/// </summary>
public enum MenuPresentation
{
    /// <summary>
    /// A sidebar that is always visible.
    /// </summary>
    Sidebar = 0,

    /// <summary>
    /// A narrow rail that is always visible.
    /// </summary>
    Rail = 1,

    /// <summary>
    /// A menu hidden until the hamburger opens it.
    /// </summary>
    Hidden = 2,

    /// <summary>
    /// The items live in the top bar.
    /// </summary>
    TopBar = 3,

    /// <summary>
    /// A rail that expands to the full menu on hover.
    /// </summary>
    Reveal = 4
}
