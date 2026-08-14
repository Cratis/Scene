// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// The root of every node in a Scene element tree.
/// </summary>
public abstract record Element
{
    /// <summary>
    /// Gets the unique identifier of the element within its screen.
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    /// Gets an open bag of properties not otherwise captured by the typed hierarchy below this type.
    /// </summary>
    public IReadOnlyDictionary<string, object?> Properties { get; init; } = new Dictionary<string, object?>();
}
