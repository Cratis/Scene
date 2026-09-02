// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// One column of a <see cref="Grid"/>.
/// </summary>
public record ColumnDefinition
{
    /// <summary>
    /// Gets how wide the column is.
    /// </summary>
    public GridLength Width { get; init; } = GridLength.Star;

    /// <summary>
    /// Gets the width the column never goes below.
    /// </summary>
    public double MinimumWidth { get; init; }

    /// <summary>
    /// Gets the width the column never goes above.
    /// </summary>
    public double MaximumWidth { get; init; } = double.PositiveInfinity;
}
