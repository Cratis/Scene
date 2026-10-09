// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Forms;

/// <summary>
/// Platform-neutral command-form geometry. It is independent of auto/manual field generation mode.
/// </summary>
/// <param name="Columns">The authored columns.</param>
/// <param name="Placements">The authored field placements.</param>
/// <param name="ColumnGap">The column gap.</param>
/// <param name="RowGap">The row gap.</param>
public record CommandFormLayout(
    IReadOnlyList<FormColumn> Columns,
    IReadOnlyList<FormFieldPlacement> Placements,
    FormWidth? ColumnGap = null,
    FormWidth? RowGap = null);
