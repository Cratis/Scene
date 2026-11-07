// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// How an item came into an outlet.
/// </summary>
public enum OutletItemSource
{
    /// <summary>A default item of the outlet's declaration.</summary>
    Default = 0,

    /// <summary>An item a lower level added when it extended or overrode the outlet.</summary>
    Own = 1,

    /// <summary>An item a level contributed.</summary>
    Contribution = 2,
}
