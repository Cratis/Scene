// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// One field a query returns.
/// </summary>
/// <param name="Name">The name.</param>
/// <param name="Type">The type.</param>
/// <param name="IsIdentity">Whether it identifies the item.</param>
public record QueryResultField(
    string Name,
    string Type,
    bool? IsIdentity = null);
