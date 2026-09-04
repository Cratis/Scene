// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// Lays its children out in a single line.
/// </summary>
public record StackPanel : Panel
{
    /// <summary>
    /// Gets the direction the line runs in.
    /// </summary>
    public Orientation Orientation { get; init; } = Orientation.Vertical;

    /// <summary>
    /// Gets the space left between one child and the next.
    /// </summary>
    public double Spacing { get; init; }
}
