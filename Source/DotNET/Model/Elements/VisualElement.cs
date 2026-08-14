// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// An <see cref="Element"/> that occupies space and can be shown or hidden.
/// </summary>
public abstract record VisualElement : Element
{
    /// <summary>
    /// Gets whether, and how, the element occupies space when not shown.
    /// </summary>
    public Visibility Visibility { get; init; } = Visibility.Visible;

    /// <summary>
    /// Gets whether the element accepts interaction.
    /// </summary>
    public bool IsEnabled { get; init; } = true;

    /// <summary>
    /// Gets the element's opacity, from 0 (fully transparent) to 1 (fully opaque).
    /// </summary>
    public double Opacity { get; init; } = 1;

    /// <summary>
    /// Gets the element's explicit size, if any.
    /// </summary>
    public Size Size { get; init; } = new();

    /// <summary>
    /// Gets the element's stacking order relative to its siblings.
    /// </summary>
    public int ZIndex { get; init; }
}
