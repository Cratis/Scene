// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a data set is imported from. */
export enum SampleDataImportFormat {
    /** A JSON array of rows, a `{ shape, rows }` object, or a whole pack. */
    Json = 'json',

    /** Comma-separated values with a header row naming the fields. */
    Csv = 'csv',
}
