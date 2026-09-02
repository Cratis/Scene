// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// Lays its children out in a line and starts a new one whenever the current line runs out of room.
/// </summary>
public record WrapPanel : Panel
{
    /// <summary>
    /// Gets the direction each line runs in.
    /// </summary>
    public Orientation Orientation { get; init; } = Orientation.Horizontal;

    /// <summary>
    /// Gets the width every child is laid out at, or <see langword="null"/> to let each child keep its own.
    /// </summary>
    public double? ItemWidth { get; init; }

    /// <summary>
    /// Gets the height every child is laid out at, or <see langword="null"/> to let each child keep its own.
    /// </summary>
    public double? ItemHeight { get; init; }
}
