// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`invoicing.list.record` would be the `record` feature of `list`). */
export interface InvoicingScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const invoicingScreenDefinitions: InvoicingScreenDefinition[] = [
    { name: 'invoicing.overview', title: 'Overview', template: 'InvoicingOverview', order: 0, description: 'What is owed, what is overdue and what came in this month.' },
    { name: 'invoicing.list', title: 'Invoices', template: 'InvoicesList', order: 1, description: 'Every invoice with what is owed and its status.' },
    { name: 'invoicing.record', title: 'Invoice', template: 'InvoicePage', parent: 'invoicing.list', description: 'One invoice: key facts, its lines, its payments and its activity.' },
    { name: 'invoicing.payments', title: 'Payments', template: 'PaymentsList', order: 2, description: 'The payments received and the invoices they settled.' },
    { name: 'invoicing.due', title: 'Due dates', template: 'InvoicingDueDates', order: 3, description: 'The day each invoice falls due, on a calendar.' },
];
