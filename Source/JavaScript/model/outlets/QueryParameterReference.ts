// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A parameter of a query, written `<query>.<parameter>` in Screenplay, such as `AllProducts.status`.
 */
export interface QueryParameterReference {
    /** The name of the query. */
    query: string;

    /** The name of the parameter. */
    parameter: string;
}

/** The own property names of {@link QueryParameterReference}, checked against the shared shape manifest. */
export const QueryParameterReferencePropertyNames: (keyof QueryParameterReference)[] = ['query', 'parameter'];
