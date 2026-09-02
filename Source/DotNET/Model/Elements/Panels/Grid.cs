// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements.Panels;

// There is deliberately no Canvas panel here. Absolute placement is already the layout model's job -
// FreeformArrangement carries an ElementPlacement (x, y, width, height) per element *per size class*,
// which says strictly more than a canvas with attached Left/Top coordinates can. A Canvas panel would
// also declare no properties of its own, and every element kind in this model is told apart by a
// property no other kind has - so it could not be recognized at render time either.

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
