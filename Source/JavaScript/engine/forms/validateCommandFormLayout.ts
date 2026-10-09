// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormWidth, FormWidthUnit } from '@cratis/scene.model';
import { CommandFormLayoutDiagnostic } from './CommandFormLayoutDiagnostic';
import { CommandFormLayoutDiagnosticCode } from './CommandFormLayoutDiagnosticCode';

/**
 * Validates authored command-form geometry without rewriting invalid drafts.
 */
export function validateCommandFormLayout(layout: CommandFormLayout, fields: readonly string[] = []): CommandFormLayoutDiagnostic[] {
    const diagnostics: CommandFormLayoutDiagnostic[] = [];
    const columnIndexes = new Set<number>();
    const knownFields = new Set(fields);

    if (!layout.columns.length) diagnostics.push(problem(CommandFormLayoutDiagnosticCode.EmptyColumns, 'At least one column is required.', 'columns'));
    layout.columns.forEach((column, index) => {
        if (!Number.isInteger(column.index) || column.index < 1) {
            diagnostics.push(problem(CommandFormLayoutDiagnosticCode.InvalidColumnIndex, `Column ${index + 1} must have a one-based integer index.`, `columns.${index}.index`));
        }
        if (columnIndexes.has(column.index)) {
            diagnostics.push(problem(CommandFormLayoutDiagnosticCode.DuplicateColumn, `Column ${column.index} is declared more than once.`, `columns.${index}.index`));
        }
        columnIndexes.add(column.index);
        validateWidth(column.width, `columns.${index}.width`, diagnostics);
        validateWidth(column.minWidth, `columns.${index}.minWidth`, diagnostics);
        validateWidth(column.maxWidth, `columns.${index}.maxWidth`, diagnostics);
    });

    validateWidth(layout.columnGap, 'columnGap', diagnostics);
    validateWidth(layout.rowGap, 'rowGap', diagnostics);

    const placements = new Set<string>();
    layout.placements.forEach((placement, index) => {
        if (!placement.field.trim()) diagnostics.push(problem(CommandFormLayoutDiagnosticCode.MissingField, 'A placement must name its field.', `placements.${index}.field`));
        if (knownFields.size && !knownFields.has(placement.field)) {
            diagnostics.push(problem(CommandFormLayoutDiagnosticCode.MissingField, `Placement targets unknown field '${placement.field}'.`, `placements.${index}.field`));
        }
        if (placements.has(placement.field)) {
            diagnostics.push(problem(CommandFormLayoutDiagnosticCode.DuplicatePlacement, `Field '${placement.field}' is placed more than once.`, `placements.${index}.field`));
        }
        placements.add(placement.field);
        if (!Number.isInteger(placement.row) || placement.row < 1 || !Number.isInteger(placement.column) || placement.column < 1 ||
            (placement.rowSpan !== undefined && (!Number.isInteger(placement.rowSpan) || placement.rowSpan < 1)) ||
            (placement.columnSpan !== undefined && (!Number.isInteger(placement.columnSpan) || placement.columnSpan < 1))) {
            diagnostics.push(problem(CommandFormLayoutDiagnosticCode.InvalidPlacement, `Placement for '${placement.field}' must use positive integer row, column and span values.`, `placements.${index}`));
        }
        const span = placement.columnSpan ?? 1;
        if (layout.columns.length && placement.column + span - 1 > layout.columns.length) {
            diagnostics.push(problem(CommandFormLayoutDiagnosticCode.OutOfBoundsPlacement, `Placement for '${placement.field}' extends beyond the declared columns.`, `placements.${index}.columnSpan`));
        }
        validateWidth(placement.width, `placements.${index}.width`, diagnostics);
    });

    return diagnostics;
}

function validateWidth(width: FormWidth | undefined, path: string, diagnostics: CommandFormLayoutDiagnostic[]): void {
    if (!width) return;
    if (!Object.values(FormWidthUnit).includes(width.unit)) {
        diagnostics.push(problem(CommandFormLayoutDiagnosticCode.InvalidWidth, `Width at '${path}' uses an unsupported unit.`, path));
        return;
    }
    if (width.unit === FormWidthUnit.Auto && width.value !== undefined) {
        diagnostics.push(problem(CommandFormLayoutDiagnosticCode.InvalidWidth, `Automatic width at '${path}' must not carry a numeric value.`, path));
    }
    if (width.unit !== FormWidthUnit.Auto && (width.value === undefined || width.value < 0 || !Number.isFinite(width.value))) {
        diagnostics.push(problem(CommandFormLayoutDiagnosticCode.InvalidWidth, `Width at '${path}' must carry a non-negative numeric value.`, path));
    }
}

function problem(code: CommandFormLayoutDiagnosticCode, message: string, path: string): CommandFormLayoutDiagnostic {
    return { code, message, path };
}
