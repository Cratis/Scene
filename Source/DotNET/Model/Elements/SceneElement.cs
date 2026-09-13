// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;
using Cratis.Scene.Model.Elements.Panels;

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// The root of every node in a Scene element tree.
/// </summary>
[JsonPolymorphic]
[JsonDerivedType(typeof(ContentControl))]
[JsonDerivedType(typeof(ItemsControl))]
[JsonDerivedType(typeof(ExternalComponent))]
[JsonDerivedType(typeof(Grid))]
[JsonDerivedType(typeof(Canvas))]
[JsonDerivedType(typeof(DockPanel))]
[JsonDerivedType(typeof(StackPanel))]
[JsonDerivedType(typeof(WrapPanel))]
public abstract record SceneElement
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
