// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// Authored placement for one command-form field in a platform-neutral grid.
/// </summary>
/// <param name="Field">The field name.</param>
/// <param name="Row">The one-based row.</param>
/// <param name="Column">The one-based column.</param>
/// <param name="RowSpan">The number of rows the field spans.</param>
/// <param name="ColumnSpan">The number of columns the field spans.</param>
/// <param name="Width">The authored field width.</param>
public record FormFieldPlacement(string Field, int Row, int Column, int? RowSpan = null, int? ColumnSpan = null, FormWidth? Width = null);
