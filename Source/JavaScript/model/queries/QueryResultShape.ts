// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How many results a query produces. Decides which component can bind to it: a table wants a collection, a
 * single-result display wants a single or an optional single.
 */
export enum QueryResultShape {
    /** Zero or more items. */
    Collection = 'collection',

    /** Exactly one item. */
    Single = 'single',

    /** One item, or none. */
    OptionalSingle = 'optional-single',
}
