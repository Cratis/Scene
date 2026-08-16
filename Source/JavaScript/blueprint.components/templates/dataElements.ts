// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { externalComponent } from '@cratis/scene.blueprint.default';
import { BorrowedComponentName } from '../BorrowedComponentName';
import { CompositeName } from '../CompositeName';
import { ColumnDefinition } from './ColumnDefinition';
import { TableOptions } from './TableOptions';

/**
 * The Arc-bound data elements this blueprint's templates are built from.
 *
 * Each one is a single `ExternalComponent` carrying a query *name* in its property bag, which is the whole
 * contract: `resolveElementBinding` in `@cratis/scene.components` reads that name out at render time and
 * looks it up in the binding registry, and a name nothing is registered under renders as a placeholder
 * naming what it wanted. Nothing here invents a second way to reach a backend, because there is only one
 * and it belongs to the component library.
 */

/**
 * The columns of a data table, as the `content` slot children the library's tables take.
 *
 * The name is PrimeReact's rather than `Cratis.Components`' - see {@link BorrowedComponentName.Column} for
 * why - and `sortable` is set on every column because a table that performs a real query can sort against
 * the server, and a column that quietly cannot is the more surprising default.
 */
export function columns(id: string, definitions: ColumnDefinition[]): SceneElement[] {
    return definitions.map(definition =>
        externalComponent(`${id}-${definition.field}`, BorrowedComponentName.Column, {
            field: definition.field,
            header: definition.header,
            sortable: true,
        }),
    );
}

/**
 * A `dataPage` - the library's whole list-screen composite, driven from one query.
 *
 * This is the archetype the package exists for. Reproducing it out of a table, a toolbar and a filter in a
 * screen would be pages of modeling for a worse result, and every one of those pages would then be an
 * application's to maintain. Here it is one element with a name in it.
 *
 * Its own `title` is deliberately empty. Every template in this package opens with an `arcPageHeader`, and
 * that header already states the page's name, its trail and what it is bound to; letting the composite
 * print the same word again directly underneath would be two sources for one fact, and they would
 * disagree the first time either changed.
 */
export function dataPage(id: string, query: string, options: TableOptions, definitions: ColumnDefinition[]): SceneElement {
    return externalComponent(id, CompositeName.DataPage, { query, title: '', ...options }, { content: columns(`${id}-column`, definitions) });
}

/**
 * A `dataTable` - the same server-side querying without the page chrome around it.
 *
 * Used where a template already has a header of its own and only needs the rows, which is most places a
 * table appears inside a larger page.
 */
export function dataTable(id: string, query: string, options: TableOptions, definitions: ColumnDefinition[]): SceneElement {
    return externalComponent(id, CompositeName.DataTable, { query, ...options }, { content: columns(`${id}-column`, definitions) });
}

/**
 * An `observableDataTable` - the live variant.
 *
 * A separate element rather than a flag, because the difference is in the *proxy* a host registers: an
 * observable query opens a subscription and re-renders when the read model changes, and a plain one does
 * not. A template that names an observable query is stating that its data is live, which is a design
 * decision worth being able to read off the page.
 */
export function observableDataTable(id: string, query: string, options: TableOptions, definitions: ColumnDefinition[]): SceneElement {
    return externalComponent(id, CompositeName.ObservableDataTable, { query, ...options }, { content: columns(`${id}-column`, definitions) });
}

/** The columns of the invoice list every list-shaped template in this package shows. */
export const invoiceColumns: ColumnDefinition[] = [
    { field: 'number', header: 'Number' },
    { field: 'customer', header: 'Customer' },
    { field: 'issued', header: 'Issued' },
    { field: 'amount', header: 'Amount' },
    { field: 'status', header: 'Status' },
];

/** The columns of the adjustment list, for the templates that show one. */
export const adjustmentColumns: ColumnDefinition[] = [
    { field: 'recorded', header: 'Recorded' },
    { field: 'reason', header: 'Reason' },
    { field: 'amount', header: 'Amount' },
];

/** The table options an invoice list uses, so eight templates cannot disagree about the empty message. */
export const invoiceTableOptions: TableOptions = {
    emptyMessage: 'No invoices yet',
    dataKey: 'invoiceId',
    globalFilterFields: ['number', 'customer', 'status'],
};
