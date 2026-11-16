// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Queries;

/// <summary>
/// One parameter of a query.
/// </summary>
/// <param name="Name">The name.</param>
/// <param name="Type">The type.</param>
/// <param name="Required">Whether an argument is required.</param>
public record QueryParameter(
    string Name,
    string Type,
    bool Required);
