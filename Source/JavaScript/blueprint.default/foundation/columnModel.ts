// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One column a table could show. */
export interface ChooserColumn {
    id: string;
    label: string;
    visible: boolean;
    locked: boolean;
}

/** Reads columns out of a property value; a column is visible unless it says otherwise, and a locked column is always visible. */
export function readColumns(value: unknown): ChooserColumn[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): ChooserColumn[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { id, label, visible, locked } = entry as Record<string, unknown>;
        if (typeof id !== 'string' || id.length === 0) return [];
        return [{ id, label: typeof label === 'string' && label.length > 0 ? label : id, visible: locked === true || visible !== false, locked: locked === true }];
    });
}

/** The ids of the visible columns, in order: what the chooser publishes and a table binds its columns to. */
export const visibleColumnIds = (columns: ChooserColumn[]): string[] => columns.filter(column => column.visible).map(column => column.id);

/** Moves a column one place up or down, staying where it is at either end. */
export function moveColumn(columns: ChooserColumn[], index: number, direction: -1 | 1): ChooserColumn[] {
    const target = index + direction;
    if (target < 0 || target >= columns.length) return columns;

    const result = [...columns];
    [result[index], result[target]] = [result[target], result[index]];
    return result;
}

/** Shows or hides a column; a locked column cannot be hidden. */
export const toggleColumn = (columns: ChooserColumn[], index: number): ChooserColumn[] =>
    columns.map((column, position) => (position === index && !column.locked ? { ...column, visible: !column.visible } : column));
