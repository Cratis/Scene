// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The grid a command form's fields are placed on, read from the form's `layout` - its columns, where each field sits and how many columns it spans - so
// the screen editor and the preview draw the same form the same way. A form with no layout is one column: one field under the other, as a form is.
export interface FormFieldPlacement {
    gridRow?: string;
    gridColumn?: string;
}

export interface FormFieldGrid {
    columns: string;
    gap?: string;
    placements: Record<string, FormFieldPlacement>;
}

interface Size {
    unit?: unknown;
    value?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const sizeOf = (size: unknown, fallback: string): string => {
    if (!isRecord(size) || typeof (size as Size).value !== 'number') return fallback;
    const { unit, value } = size as { unit?: unknown; value: number };
    switch (unit) {
        case 'fraction': return `${value}fr`;
        case 'pixels': return `${value}px`;
        case 'percent': return `${value}%`;
        default: return fallback;
    }
};

export function formFieldGridOf(layout: unknown): FormFieldGrid {
    if (!isRecord(layout)) return { columns: '1fr', placements: {} };
    const columns = (Array.isArray(layout.columns) ? layout.columns : []).filter(isRecord)
        .slice()
        .sort((left, right) => (typeof left.index === 'number' ? left.index : 0) - (typeof right.index === 'number' ? right.index : 0))
        .map(column => `minmax(0, ${sizeOf(column.width, '1fr')})`);
    const placements: Record<string, FormFieldPlacement> = {};
    for (const placement of (Array.isArray(layout.placements) ? layout.placements : []).filter(isRecord)) {
        if (typeof placement.field !== 'string') continue;
        const span = typeof placement.columnSpan === 'number' && placement.columnSpan > 1 ? placement.columnSpan : 1;
        placements[placement.field] = {
            ...(typeof placement.row === 'number' ? { gridRow: `${placement.row}` } : {}),
            ...(typeof placement.column === 'number' ? { gridColumn: `${placement.column} / span ${span}` } : span > 1 ? { gridColumn: `span ${span}` } : {}),
        };
    }

    const gap = sizeOf(layout.columnGap, '');
    return { columns: columns.length > 0 ? columns.join(' ') : '1fr', ...(gap ? { gap } : {}), placements };
}
