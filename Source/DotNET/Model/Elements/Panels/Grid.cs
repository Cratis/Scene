// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// Lays its children out in rows and columns. A child states which cell it occupies through the
/// <c>Grid.Row</c>, <c>Grid.Column</c>, <c>Grid.RowSpan</c> and <c>Grid.ColumnSpan</c> keys of its
/// <see cref="SceneElement.Properties"/>.
/// </summary>
public record Grid : Panel
{
    /// <summary>
    /// Gets the rows, top to bottom.
    /// </summary>
    public IReadOnlyList<RowDefinition> Rows { get; init; } = [];

    /// <summary>
    /// Gets the columns, left to right.
    /// </summary>
    public IReadOnlyList<ColumnDefinition> Columns { get; init; } = [];
}
