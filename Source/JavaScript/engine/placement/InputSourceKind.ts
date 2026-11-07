// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where a command input gets its value when an action runs, without asking for it in a form. The C# engine uses the same
 * values (`InputSourceKind`).
 */
export enum InputSourceKind {
    /** A path into the data context of the screen, such as the selected product's `sku`. */
    DataContext = 'dataContext',

    /** A route value of the page, such as `:sku`. */
    Route = 'route',

    /** What another component publishes, such as the selected row of a table or what someone typed into an input. */
    Component = 'component',

    /** A constant the author wrote. */
    Constant = 'constant',
}
