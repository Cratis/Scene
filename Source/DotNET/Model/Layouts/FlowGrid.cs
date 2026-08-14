// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A <see cref="FlowContainer"/> that arranges its children in a grid.
/// </summary>
public record FlowGrid : FlowContainer
{
    /// <summary>
    /// Gets the number of columns, or <see langword="null"/> to size columns from content.
    /// </summary>
    public int? Columns { get; init; }

    /// <summary>
    /// Gets the number of rows, or <see langword="null"/> to size rows from content.
    /// </summary>
    public int? Rows { get; init; }
}
