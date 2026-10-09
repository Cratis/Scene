// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The data states a template preview can show. A template is only worth choosing if it looks right in all
 * four, because an application spends real time in each of them.
 */
export enum TemplatePreviewState {
    /** The seeded, realistic records. */
    Populated = 'populated',

    /** The query returned nothing; each table shows its empty message. */
    Empty = 'empty',

    /** The query has not answered yet; each table announces that it is loading. */
    Loading = 'loading',

    /** The query failed; each table announces the error in place of its rows. */
    Error = 'error',
}
