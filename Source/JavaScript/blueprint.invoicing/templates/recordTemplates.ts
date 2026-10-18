// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { InvoicingEntityKind, currencyOfData, fromQuery, localeOfData, invoicingQueriesOf } from '../invoicingQueries';
import { actionButton, component, goesTo, invoicingMetadata, opensDialog, withBehaviors } from '../invoicingParts';

interface Fact { id: string; label: string; field: string; format?: 'currency' | 'percent' }
interface Extra { key: string; label: string; titleField: string; pageSize?: number }
interface Action { id: string; label: string; emphasis: 'primary' | 'secondary' | 'quiet' | 'danger'; dialog?: string; screen?: string }

interface RecordOptions {
    name: string;
    entity: InvoicingEntityKind;
    displayName: string;
    description: string;
    titleField: string;
    backScreen: string;
    backLabel: string;
    facts: Fact[];
    extras: Extra[];
    actions: Action[];
}

/**
 * One record page: the foundation `RecordPage` with the record's own title, its status and key facts at the top, its fields and the lists that belong to it in the
 * main region, and the activity beside it. What it shows is the record the list handed it the id of.
 */
function recordPageOf(options: RecordOptions): ScreenTemplate {
    const queries = invoicingQueriesOf(options.entity);
    const id = options.name;
    return {
        name: options.name,
        fitsSlot: 'content',
        slots: recordPageTemplate.slots,
        arrangement: recordPageTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: fromQuery(queries.record, `0.${options.titleField}`), subtitle: fromQuery(queries.record, '0.summary') }, {
                actions: [
                    withBehaviors(actionButton(`${id}-back`, options.backLabel, 'secondary'), goesTo(options.backScreen)),
                    ...options.actions.map(action => withBehaviors(actionButton(`${id}-${action.id}`, action.label, action.emphasis), action.dialog ? opensDialog(action.dialog) : goesTo(action.screen!))),
                ],
            })],
            summary: [
                component(`${id}-status`, 'statusChip', { status: fromQuery(queries.summary, '0.status'), tone: fromQuery(queries.summary, '0.tone') }),
                ...options.facts.map(fact => component(`${id}-${fact.id}`, 'statCard', {
                    label: fact.label, value: fromQuery(queries.summary, `0.${fact.field}`), ...(fact.format ? { format: fact.format } : {}), ...currencyOfData,
                })),
            ],
            tabs: [component(`${id}-tabs`, 'tabSet', { tabs: fromQuery(queries.tabs), urlKey: 'tab', label: `${options.displayName} sections` })],
            main: [
                component(`${id}-form`, 'formScreenBody', { mode: 'readOnly', sections: fromQuery(queries.sections), values: fromQuery(queries.record, '0'), ...currencyOfData }),
                ...options.extras.map(extra => component(`${id}-${extra.key.toLowerCase()}`, 'dataList', {
                    label: extra.label, rows: fromQuery(`${options.entity}${extra.key}`), columns: fromQuery(`${options.entity}${extra.key}Columns`), titleField: extra.titleField, pageSize: extra.pageSize ?? 8, ...currencyOfData,
                })),
            ],
            related: [],
            activity: [component(`${id}-activity`, 'activityFeed', { label: 'Activity', entries: fromQuery(queries.activity), ...localeOfData })],
            aside: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: invoicingMetadata(options.name, 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
    };
}

/** The invoice page: the invoice number as its title, its status, total, paid amount and balance due at the top, its fields, lines and payments in the main region, and the activity beside it. */
export const invoicePageTemplate = recordPageOf({
    name: 'InvoicePage', entity: InvoicingEntityKind.Invoice, displayName: 'Invoice page', description: 'One invoice: status, total, paid and balance due, its details, lines and payments, and its activity.', titleField: 'number', backScreen: 'invoicing.list', backLabel: 'Back to invoices',
    facts: [
        { id: 'total', label: 'Invoice total', field: 'total', format: 'currency' },
        { id: 'paid', label: 'Paid', field: 'paid', format: 'currency' },
        { id: 'balance', label: 'Balance due', field: 'balance', format: 'currency' },
        { id: 'days', label: 'Days to due date', field: 'daysToDue' },
    ],
    extras: [{ key: 'Lines', label: 'Invoice lines', titleField: 'description' }, { key: 'Payments', label: 'Payments', titleField: 'reference' }],
    actions: [{ id: 'pay', label: 'Record payment', emphasis: 'primary', dialog: 'InvoicingRecordPayment' }],
});
