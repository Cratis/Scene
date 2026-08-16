// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One column of a table, reduced to what PrimeReact's `Column` actually needs to render it.
 */
export interface ColumnDefinition {
    /**
     * The row property the column shows.
     */
    field: string;

    /**
     * The column heading. Falls back to the field name, so a column authored with only a field is still
     * labeled rather than blank.
     */
    header: string;

    /**
     * Whether clicking the heading sorts by this column.
     */
    sortable: boolean;
}
