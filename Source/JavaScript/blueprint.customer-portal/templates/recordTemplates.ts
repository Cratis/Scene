// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { CustomerPortalEntityKind, currencyOfData, fromQuery, localeOfData, customerPortalQueriesOf } from '../customerPortalQueries';
import { actionButton, component, goesTo, customerPortalMetadata, opensDialog, withBehaviors } from '../customerPortalParts';

interface Fact { id: string; label: string; field: string; format?: 'currency' | 'percent' }
interface Extra { key: string; label: string; titleField: string; pageSize?: number }
interface Action { id: string; label: string; emphasis: 'primary' | 'secondary' | 'quiet' | 'danger'; dialog?: string; screen?: string }

interface RecordOptions {
    name: string;
    entity: CustomerPortalEntityKind;
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
    const queries = customerPortalQueriesOf(options.entity);
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
        metadata: customerPortalMetadata(options.name, 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
    };
}

/** The customer's order page: the order number as its title, its status, total, items and days to delivery at the top, its details, lines and tracking in the main region, and what happened to it beside them. */
export const portalOrderPageTemplate = recordPageOf({
    name: 'PortalOrderPage', entity: CustomerPortalEntityKind.PortalOrder, displayName: 'Portal order page', description: 'One of your orders: status, total, items and days to delivery, its details, lines and tracking, and what happened to it.', titleField: 'number', backScreen: 'portal.orders', backLabel: 'Back to orders',
    facts: [
        { id: 'total', label: 'Order total', field: 'total', format: 'currency' },
        { id: 'items', label: 'Items', field: 'items' },
        { id: 'days', label: 'Days to delivery', field: 'daysToDelivery' },
    ],
    extras: [{ key: 'Lines', label: 'Order lines', titleField: 'name' }, { key: 'Tracking', label: 'Tracking', titleField: 'reference' }],
    actions: [{ id: 'help', label: 'Ask about this order', emphasis: 'secondary', dialog: 'PortalNewSupportRequest' }],
});
