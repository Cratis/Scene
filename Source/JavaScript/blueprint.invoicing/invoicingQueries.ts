// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind } from '@cratis/scene.model';

/**
 * A property taken from a query result - never a value. A invoicing template declares *where* its data comes from and the sample-data pack, or the real
 * query, supplies the rows (spec SD1); `path` reaches into the result (`0.value` is the first row's `value`, an empty path is the whole result).
 */
export const fromQuery = (query: string, path = ''): BindingExpression => ({ kind: BindingSourceKind.QueryResult, query, path });

/** The queries of the screens that are not a plain list. Each is a shape the sample-data pack supplies rows for. */
export const InvoicingQuery = {
    /** One row: the `locale` and `currency` the figures and dates are formatted in. */
    Settings: 'InvoicingSettings',
    Kpis: 'InvoicingKpis',
    Aging: 'InvoicingAging',
    InvoicedAndCollected: 'InvoicingInvoicedAndCollected',
    Activity: 'InvoicingActivity',
    DueDates: 'InvoicingDueDates',
    DueColumns: 'InvoicingDueColumns',
    FormErrors: 'InvoicingFormErrors',
} as const;

/** The entities a template is made for. */
export enum InvoicingEntityKind {
    Invoice = 'Invoice',
    Payment = 'Payment',
}

/** The read model (and so the shape) the records of each entity are queried from. */
export const invoicingEntityPlural: Record<InvoicingEntityKind, string> = {
    [InvoicingEntityKind.Invoice]: 'Invoices',
    [InvoicingEntityKind.Payment]: 'Payments',
};

/**
 * The queries one entity's templates bind to, named from the entity so a template never spells one out: the records, the columns and filter fields of the
 * list, its saved views and column choices, the selection, the sections of the quick form, and what the record page shows.
 */
export const invoicingQueriesOf = (entity: InvoicingEntityKind) => ({
    rows: invoicingEntityPlural[entity],
    columns: `${entity}Columns`,
    filterFields: `${entity}FilterFields`,
    views: `${entity}Views`,
    columnChoices: `${entity}ColumnChoices`,
    selection: `${entity}Selection`,
    quickSections: `${entity}QuickSections`,
    record: `${entity}Record`,
    sections: `${entity}Sections`,
    summary: `${entity}Summary`,
    activity: `${entity}Activity`,
    tabs: `${entity}Tabs`,
});

/** The locale and currency of the data, bound onto every component that formats a figure or a date. */
export const localeOfData = { locale: fromQuery(InvoicingQuery.Settings, '0.locale') };
export const currencyOfData = { ...localeOfData, currency: fromQuery(InvoicingQuery.Settings, '0.currency') };
