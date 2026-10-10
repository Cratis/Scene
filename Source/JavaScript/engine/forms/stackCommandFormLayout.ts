// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormWidthUnit } from '@cratis/scene.model';

/**
 * The layout a command form uses at a compact width: one full-width column, every field on its own row,
 * in reading order - row first, then column, then authored order. Spans and per-field widths are dropped
 * because there is nothing to span. The authored layout is not changed, so the form returns to its columns
 * at a regular width.
 */
export function stackCommandFormLayout(layout: CommandFormLayout): CommandFormLayout {
    const ordered = layout.placements
        .map((placement, order) => ({ placement, order }))
        .sort((left, right) => left.placement.row - right.placement.row || left.placement.column - right.placement.column || left.order - right.order);

    return {
        ...layout,
        columns: [{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 1 } }],
        placements: ordered.map(({ placement }, index) => ({ field: placement.field, row: index + 1, column: 1 })),
    };
}
