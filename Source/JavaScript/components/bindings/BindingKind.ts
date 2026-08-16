// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a name in a screen is expected to resolve to when it is looked up in the binding registry.
 *
 * Queries and commands are kept apart rather than sharing one namespace because they are opposite halves
 * of CQRS and a screen means exactly one of them at each site: `data Invoices via query AllInvoices`
 * cannot be satisfied by a command of the same name, and letting it be satisfied would turn a modeling
 * mistake into a runtime one.
 */
export enum BindingKind {
    /** An Arc query proxy - what a data table or data page reads its rows from. */
    Query = 'query',

    /** An Arc command proxy - what a command form or command dialog submits. */
    Command = 'command',
}
