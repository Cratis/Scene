// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// How a lower level treats the items of an outlet it inherits.
/// </summary>
public enum OutletMode
{
    /// <summary>Keep the inherited items unchanged.</summary>
    Inherits = 0,

    /// <summary>Keep the inherited items, minus the hidden ones, and add this level's after them.</summary>
    Extends = 1,

    /// <summary>Replace the inherited items with this level's.</summary>
    Overrides = 2,
}
