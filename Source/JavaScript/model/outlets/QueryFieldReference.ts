// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A field of the result of a query, written `<query>.<field>` in Screenplay, such as `ProductStats.drafts`.
 */
export interface QueryFieldReference {
    /** The name of the query. */
    query: string;

    /** The name of the field. */
    field: string;
}

/** The own property names of {@link QueryFieldReference}, checked against the shared shape manifest. */
export const QueryFieldReferencePropertyNames: (keyof QueryFieldReference)[] = ['query', 'field'];
