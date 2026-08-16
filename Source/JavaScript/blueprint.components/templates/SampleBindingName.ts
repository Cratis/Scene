// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The Arc query and command names this blueprint's templates ship bound to.
 *
 * A template carries a binding *name*, never a class - the binding registry in `@cratis/scene.components`
 * is what turns a name into the generated proxy at render time, and only a host owns those proxies. So a
 * template has to write some name, and these are the ones it writes.
 *
 * They are defaults, not fixtures. An application picking `DataListPage` replaces `AllInvoices` with its
 * own query and the page is done; nothing else about the template changes. Shipping a template with no
 * name at all would have been the alternative, and it is a worse one - it renders as a diagram of a page
 * rather than a page, and the thing a template most needs to prove is that it composes into something
 * real.
 *
 * The names are deliberately in the shape Arc generates: a `[ReadModel]`'s static query method
 * (`AllInvoices`), and a `[Command]` record (`RegisterInvoice`). A designer reading a preview should
 * recognize them as the artifacts they would really be wiring.
 *
 * This is an enum of *this package's defaults*, not of every name a binding may take. The element builders
 * therefore take a plain `string`, so an application can point the same builders at `AllPurchaseOrders`
 * without having to widen anything - the set of Arc proxies in an application is open, and a closed type
 * over it would make these builders usable only for the invoices they ship bound to.
 */
export enum SampleBindingName {
    /** Every invoice - the snapshot query a list page reads. */
    AllInvoices = 'AllInvoices',

    /** Invoices still being processed - an observable query, so the page is live. */
    InvoicesInFlight = 'InvoicesInFlight',

    /** One invoice by its id - what a detail region reads. */
    InvoiceById = 'InvoiceById',

    /** Revenue aggregated by month - a dashboard widget's query. */
    RevenueByMonth = 'RevenueByMonth',

    /** Open support tickets - a second dashboard widget's query. */
    OpenTickets = 'OpenTickets',

    /** Every adjustment recorded against an invoice. */
    AllAdjustments = 'AllAdjustments',

    /** Registers a new invoice - the command a form page submits. */
    RegisterInvoice = 'RegisterInvoice',

    /** Records an adjustment against an invoice - the command a dialog submits. */
    RecordAdjustment = 'RecordAdjustment',
}
