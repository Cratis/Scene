// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// Why an inherited item is not among an outlet's resolved items.
/// </summary>
public enum OutletRemoval
{
    /// <summary>A lower level hid it.</summary>
    Hidden = 0,

    /// <summary>A lower level overrode the outlet.</summary>
    Overridden = 1,
}
