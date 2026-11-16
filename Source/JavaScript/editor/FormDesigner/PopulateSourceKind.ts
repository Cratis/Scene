// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Which kind of `PopulateSource` a {@link Form} declares, or that it declares none - part of
 * StudioIssues#157's populate-source picker.
 */
export enum PopulateSourceKind {
    /** The form has no `populateSource` - its fields start empty. */
    None = 'none',

    /** `populate via query <Query> [by <param>]`. */
    ViaQuery = 'viaQuery',

    /** `populate from item`. */
    FromItem = 'fromItem',
}
