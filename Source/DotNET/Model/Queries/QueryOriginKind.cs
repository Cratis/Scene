// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// What a query originates from.
/// </summary>
public enum QueryOriginKind
{
    /// <summary>
    /// A feature.
    /// </summary>
    Feature = 0,

    /// <summary>
    /// A slice.
    /// </summary>
    Slice = 1,
}
