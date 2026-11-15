// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// Where a query comes from.
/// </summary>
/// <param name="Kind">What it originates from.</param>
/// <param name="Id">The id of the origin.</param>
/// <param name="Name">The name of the origin.</param>
public record QueryOrigin(
    QueryOriginKind Kind,
    string Id,
    string Name);
