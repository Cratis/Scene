// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One column of a data table, as a template declares it.
 *
 * Two fields and no more, because that is genuinely all a column needs in a template: which property of
 * the read model it shows, and what the heading says. Everything else a PrimeReact `Column` can do -
 * sorting, filtering, body templates - is either turned on for the whole table or is application-specific
 * detail that belongs in the application's own screen rather than in a shipped template.
 */
export interface ColumnDefinition {
    /** The read-model property the column shows. */
    field: string;

    /** The column heading. */
    header: string;
}
