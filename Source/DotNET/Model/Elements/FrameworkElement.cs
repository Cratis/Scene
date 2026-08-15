// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// A <see cref="VisualElement"/> that participates in layout: it has a name, size constraints,
/// margin and alignment within the space allotted to it by its parent.
/// </summary>
public abstract record FrameworkElement : VisualElement
{
    /// <summary>
    /// Gets the element's name, unique within its screen.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets the element's minimum size, if constrained.
    /// </summary>
    public Size MinimumSize { get; init; } = new();

    /// <summary>
    /// Gets the element's maximum size, if constrained.
    /// </summary>
    public Size MaximumSize { get; init; } = new();

    /// <summary>
    /// Gets the space reserved around the element.
    /// </summary>
    public Thickness Margin { get; init; } = new();

    /// <summary>
    /// Gets how the element aligns horizontally within its allotted space.
    /// </summary>
    public HorizontalAlignment HorizontalAlignment { get; init; } = HorizontalAlignment.Stretch;

    /// <summary>
    /// Gets how the element aligns vertically within its allotted space.
    /// </summary>
    public VerticalAlignment VerticalAlignment { get; init; } = VerticalAlignment.Stretch;
}
