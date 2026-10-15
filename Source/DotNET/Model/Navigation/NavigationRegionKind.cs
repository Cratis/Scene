// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// The navigation regions an application shell has.
/// </summary>
public enum NavigationRegionKind
{
    /// <summary>The flat strip along the top.</summary>
    Topbar = 0,

    /// <summary>The side list, whose items may have sub-items.</summary>
    Sidebar = 1,
}
