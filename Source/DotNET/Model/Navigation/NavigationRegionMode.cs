// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// How a module's region relates to the application's items for the same region.
/// </summary>
public enum NavigationRegionMode
{
    /// <summary>Effective items are the application items; the module's own items are cleared.</summary>
    Inherit = 0,

    /// <summary>Effective items are the application items followed by the module's items.</summary>
    Extend = 1,

    /// <summary>Effective items are the module's items only.</summary>
    Override = 2,
}
