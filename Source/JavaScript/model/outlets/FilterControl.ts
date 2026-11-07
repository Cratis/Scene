// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The control a filter shows. When a filter names none, the type of the query parameter it sets decides.
 */
export enum FilterControl {
    /** A free-text search box. */
    Search = 'search',

    /** Choice chips, one per value. */
    Choice = 'choice',

    /** A range between two values. */
    Range = 'range',

    /** A date or a date range. */
    Date = 'date',
}
