// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;
using Cratis.Scene.Model.Elements.Panels;
using Cratis.Scene.Model.Interactions;

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

    /// <summary>
    /// Gets the behaviors attached to the element - what happens when someone interacts with it.
    /// </summary>
    /// <remarks>
    /// On the element rather than on a wrapper, because interaction belongs to the thing being interacted with.
    /// Attachments are additive with whatever a screen, template, layout, module or feature attached further out.
    /// </remarks>
    public IReadOnlyList<Behavior> Behaviors { get; init; } = [];
}
