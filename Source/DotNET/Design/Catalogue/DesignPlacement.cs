// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// Where a component may be placed.
/// </summary>
public enum DesignPlacement
{
    /// <summary>Into an outlet of a screen.</summary>
    Outlet = 0,

    /// <summary>Opened by an action; never placed in an outlet.</summary>
    Overlay = 1,

    /// <summary>Part of the root template; never placed on a screen.</summary>
    Shell = 2,
}
