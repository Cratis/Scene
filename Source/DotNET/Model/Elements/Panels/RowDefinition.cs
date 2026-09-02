// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// One row of a <see cref="Grid"/>.
/// </summary>
public record RowDefinition
{
    /// <summary>
    /// Gets how tall the row is.
    /// </summary>
    public GridLength Height { get; init; } = GridLength.Star;

    /// <summary>
    /// Gets the height the row never goes below.
    /// </summary>
    public double MinimumHeight { get; init; }

    /// <summary>
    /// Gets the height the row never goes above.
    /// </summary>
    public double MaximumHeight { get; init; } = double.PositiveInfinity;
}
