// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormColumn, FormFieldPlacement, FormWidth, FormWidthUnit } from '@cratis/scene.model';
import { objectProperty } from '../properties';

/** Reads typed command-form layout metadata from an external component property bag. */
export function commandFormLayout(properties: Record<string, unknown>): CommandFormLayout | undefined {
    const layout = objectProperty(properties, 'layout');
    if (!layout) return undefined;
    const columns = arrayOfObjects(layout.columns)?.map(readColumn).filter((column): column is FormColumn => column !== undefined);
    const placements = arrayOfObjects(layout.placements)?.map(readPlacement).filter((placement): placement is FormFieldPlacement => placement !== undefined);
    if (!columns || !placements) return undefined;
    return {
        columns,
        placements,
        ...(readWidth(layout.columnGap) ? { columnGap: readWidth(layout.columnGap) } : {}),
        ...(readWidth(layout.rowGap) ? { rowGap: readWidth(layout.rowGap) } : {}),
    };
}

function readColumn(value: Record<string, unknown>): FormColumn | undefined {
    const index = numberValue(value.index);
    if (index === undefined) return undefined;
    return {
        index,
        ...(readWidth(value.width) ? { width: readWidth(value.width) } : {}),
        ...(readWidth(value.minWidth) ? { minWidth: readWidth(value.minWidth) } : {}),
        ...(readWidth(value.maxWidth) ? { maxWidth: readWidth(value.maxWidth) } : {}),
    };
}

function readPlacement(value: Record<string, unknown>): FormFieldPlacement | undefined {
    const field = typeof value.field === 'string' ? value.field : undefined;
    const row = numberValue(value.row);
    const column = numberValue(value.column);
    if (!field || row === undefined || column === undefined) return undefined;
    return {
        field,
        row,
        column,
        ...(numberValue(value.rowSpan) ? { rowSpan: numberValue(value.rowSpan) } : {}),
        ...(numberValue(value.columnSpan) ? { columnSpan: numberValue(value.columnSpan) } : {}),
        ...(readWidth(value.width) ? { width: readWidth(value.width) } : {}),
    };
}

function readWidth(value: unknown): FormWidth | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
    const record = value as Record<string, unknown>;
    if (!Object.values(FormWidthUnit).includes(record.unit as FormWidthUnit)) return undefined;
    return { unit: record.unit as FormWidthUnit, ...(numberValue(record.value) !== undefined ? { value: numberValue(record.value) } : {}) };
}

function arrayOfObjects(value: unknown): Record<string, unknown>[] | undefined {
    return Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null && !Array.isArray(item)) ? value as Record<string, unknown>[] : undefined;
}

function numberValue(value: unknown): number | undefined {
    return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}
