// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One column of a table, reduced to what a Scene screen can actually say about it.
 *
 * This is the resolved form of {@link ColumnProps} - every field required rather than optional, with the
 * fallbacks already applied - and it is what {@link columnDefinitions} derives from a table element's
 * model. The two shapes are deliberately kept assignable so the table renders from either without
 * caring which one it was handed.
 *
 * It stops at `field`, `header` and `sortable` because those are the only three a screen's authored
 * properties can express. `body` is a function and `filter` needs chrome a screen cannot configure, so
 * both stay on the declaration side, reachable only when a React caller composes `Column` directly.
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
