// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FC, ReactNode } from 'react';

/**
 * What one column of a table declares about itself.
 *
 * This is deliberately the smallest set a table needs to draw a heading and a cell. PrimeReact 10's
 * `Column` also carried `editor`, `frozen`, `footer`, `colSpan` and `expander`; none of them are carried
 * over. Editing, frozen panes and footers are table-wide behaviors that a Scene screen has no way to
 * drive - there is nowhere for an edit to go and nothing to compute a footer from - and `colSpan` and
 * `expander` only mean anything inside layouts (column groups, nested rows) this package no longer
 * offers. Re-declaring them here would advertise capabilities the adapters cannot honor.
 */
export interface ColumnProps {
    /**
     * The row property the column shows. Also the field the table sorts and filters by, which is why a
     * column without one gets neither: there is nothing to key the operation on.
     */
    field?: string;

    /**
     * The column heading. A column authored with only a field falls back to the field name rather than
     * rendering blank, so a half-configured table still reads as a table.
     */
    header?: string;

    /**
     * Renders the cell from the whole row instead of from a single field. This is the escape hatch for a
     * column that shows something derived - two fields joined, a formatted date, a badge - and it is the
     * one reason a column may sensibly omit `field`.
     */
    body?: (row: Record<string, unknown>) => ReactNode;

    /**
     * Whether clicking the heading sorts by this column.
     */
    sortable?: boolean;

    /**
     * Whether the heading offers an inline filter for this column.
     */
    filter?: boolean;
}

/**
 * One column of a table - Cratis-owned, because PrimeReact 11 removed `primereact/column` outright.
 *
 * In PrimeReact 10 `Column` was a real participant: `DataTable` walked its children, recognized them by
 * React element type, and rendered the table from their props. PrimeReact 11 replaced that with a
 * compositional table whose header and body cells the caller writes out itself, so nothing in the library
 * is left to declare a column with. Cratis Components rebuilt the same `<Column field header body
 * sortable filter />` authoring model on top of the new table, and this is that same move for Scene: the
 * component renders nothing on its own and exists only to be read.
 *
 * Being a pure declaration is the whole point - it is what lets a column be written where it belongs,
 * inside the table it configures, without the table having to interpret arbitrary children.
 */
export const Column: FC<ColumnProps> = () => null;

Column.displayName = 'Column';
