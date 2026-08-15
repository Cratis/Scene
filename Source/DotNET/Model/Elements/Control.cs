// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// A <see cref="FrameworkElement"/> that can be styled with colors, spacing and typography, and that
/// participates in tab order.
/// </summary>
public abstract record Control : FrameworkElement
{
    /// <summary>
    /// Gets the background color, if overridden from the active theme.
    /// </summary>
    public Color? Background { get; init; }

    /// <summary>
    /// Gets the foreground color, if overridden from the active theme.
    /// </summary>
    public Color? Foreground { get; init; }

    /// <summary>
    /// Gets the border color, if overridden from the active theme.
    /// </summary>
    public Color? BorderColor { get; init; }

    /// <summary>
    /// Gets the border thickness.
    /// </summary>
    public Thickness BorderThickness { get; init; } = new();

    /// <summary>
    /// Gets the space reserved between the element's border and its content.
    /// </summary>
    public Thickness Padding { get; init; } = new();

    /// <summary>
    /// Gets the font family, if overridden from the active theme.
    /// </summary>
    public string? FontFamily { get; init; }

    /// <summary>
    /// Gets the font size, if overridden from the active theme.
    /// </summary>
    public double? FontSize { get; init; }

    /// <summary>
    /// Gets the control's position in tab order.
    /// </summary>
    public int TabIndex { get; init; }
}
