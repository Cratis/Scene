// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The source a binding reads from.
 */
export enum BindingSourceKind {
    /** The inherited effective data context for the element. */
    DataContext = 'dataContext',

    /** The latest result of a named query binding. */
    QueryResult = 'queryResult',

    /** An output property from another stable component identity. */
    ComponentProperty = 'componentProperty',

    /** A literal value carried by the binding. */
    Literal = 'literal',
}
