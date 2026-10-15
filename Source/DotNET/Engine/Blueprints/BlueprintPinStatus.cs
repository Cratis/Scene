// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// Where a blueprint reference's pin stands against what is installed and what is available.
/// </summary>
public enum BlueprintPinStatus
{
    /// <summary>
    /// The installed version satisfies the pin and nothing newer is available.
    /// </summary>
    Current = 0,

    /// <summary>
    /// A newer version the pin allows is available: taking it changes nothing the pin promised to keep.
    /// </summary>
    UpdateAvailable = 1,

    /// <summary>
    /// A newer version is available that the pin does not allow - usually a new major version - so taking it is a deliberate move that rewrites the pin.
    /// </summary>
    UpdateBlockedByPin = 2,

    /// <summary>
    /// The installed version does not satisfy the pin: the reference was chosen from a version that is no longer there.
    /// </summary>
    NotSatisfied = 3,

    /// <summary>
    /// The pin or a version is not one the engine understands.
    /// </summary>
    Invalid = 4,
}
