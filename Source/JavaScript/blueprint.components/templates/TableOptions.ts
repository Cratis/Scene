// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The settings every table-shaped element in this package shares.
 *
 * `emptyMessage` and `dataKey` are required rather than optional on purpose. The library's adapters both
 * default them to an empty string, and both defaults are quietly wrong in a shipped template: a table with
 * no empty message reads as broken when the query legitimately returns nothing, and a table with no data
 * key loses its selection every time the query is re-performed. Making them required means a template
 * cannot be written without deciding.
 */
export interface TableOptions {
    /** The message shown when the query returns nothing. */
    emptyMessage: string;

    /** The read-model property that identifies a row, so selection survives a re-query. */
    dataKey: string;

    /** The fields the search box filters across, when the table offers one. */
    globalFilterFields?: string[];
}
