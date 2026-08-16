// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The seeded content the Arc-free composites in this package's templates render.
 *
 * There is a real split running through this blueprint, and it is worth naming rather than hiding. Most of
 * `@cratis/components` is Arc-bound: a data page, a table, a command form and a command dialog all need a
 * registered proxy and a live backend before they show anything, so at design time they are placeholders,
 * and that is correct.
 *
 * The editors are not. A schema editor, a document editor, a navigational bar and a time machine all take
 * their content from the property bag, so a template that seeds them renders as a working page with no
 * backend at all. That is why the editor templates carry this data: it makes two of this package's pages
 * genuinely usable in a preview, rather than eight pages of dashed boxes.
 *
 * The shape is an invoice throughout, matching the query and command names the other templates bind to, so
 * the whole package reads as one small application rather than eight unrelated demonstrations.
 */

/** A JSON schema in the shape Chronicle emits for an event type - what `schemaEditor` edits. */
export const invoiceSchema: Record<string, unknown> = {
    title: 'InvoiceRegistered',
    type: 'object',
    properties: {
        number: { type: 'string', description: 'The invoice number as printed on the document.' },
        customer: { type: 'string', description: 'The customer the invoice is addressed to.' },
        issued: { type: 'string', format: 'date-time', description: 'When the invoice was issued.' },
        amount: { type: 'number', description: 'The gross amount, in the invoice currency.' },
        currency: { type: 'string', description: 'The ISO currency code.' },
    },
};

/** One invoice as a plain document - what `objectContentEditor` renders against {@link invoiceSchema}. */
export const invoiceDocument: Record<string, unknown> = {
    number: 'INV-2043',
    customer: 'Northwind Traders',
    issued: '2026-01-05T09:30:00Z',
    amount: 4200,
    currency: 'USD',
};

/** Where in the document the navigational bar currently is. */
export const invoiceNavigationPath: string[] = ['lines', 'shipping'];

/**
 * Successive versions of the invoice, for the time machine.
 *
 * Every entry has an id, a label and a parseable timestamp, because the adapter drops any that does not -
 * a version invented at the epoch would not be a slightly wrong entry, it would silently reorder every
 * real one around it.
 */
export const invoiceVersions: Record<string, unknown>[] = [
    { id: 'v3', label: 'Adjustment recorded', timestamp: '2026-01-12T14:05:00Z', content: 'Amount reduced by 120.00 - damaged goods' },
    { id: 'v2', label: 'Approved', timestamp: '2026-01-07T08:15:00Z', content: 'Approved by Amelia Nyquist' },
    { id: 'v1', label: 'Registered', timestamp: '2026-01-05T09:30:00Z', content: 'Registered from the supplier portal' },
];

/** The filters the list templates offer, in the shape `filterPanel` reads. */
export const invoiceFilters: Record<string, unknown>[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'string',
        multi: true,
        options: [
            { key: 'draft', label: 'Draft', count: 12 },
            { key: 'approved', label: 'Approved', count: 44 },
            { key: 'paid', label: 'Paid', count: 108 },
        ],
    },
    { key: 'amount', label: 'Amount', type: 'number', buckets: 4 },
    { key: 'issued', label: 'Issued', type: 'date' },
];

/** The status choices a command form's dropdown offers. */
export const statusOptions: { label: string; value: string }[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Approved', value: 'approved' },
    { label: 'Paid', value: 'paid' },
];
