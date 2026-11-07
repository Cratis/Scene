// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// What an <see cref="Outlet"/> lists. Every kind shares the same inheritance and contributions; only the items differ.
/// </summary>
public enum OutletKind
{
    /// <summary>Buttons, menu entries, separators and groups that run a slice, navigate or run a built-in.</summary>
    Actions = 0,

    /// <summary>Filters that set a parameter of the query the screen shows.</summary>
    Filters = 1,

    /// <summary>Tabs, each showing a screen in the slot the outlet owns.</summary>
    Tabs = 2,

    /// <summary>Stats, each showing a field of a single-result query.</summary>
    Stats = 3,

    /// <summary>Navigation items that open a module, a feature or a screen.</summary>
    Navigation = 4,
}
