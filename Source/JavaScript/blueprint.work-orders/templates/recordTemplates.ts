// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { WorkOrdersEntityKind, currencyOfData, fromQuery, localeOfData, workOrdersQueriesOf } from '../workOrdersQueries';
import { actionButton, component, goesTo, workOrdersMetadata, opensDialog, withBehaviors } from '../workOrdersParts';

interface Fact { id: string; label: string; field: string; format?: 'currency' | 'percent' }
interface Extra { key: string; label: string; titleField: string; pageSize?: number }
interface Action { id: string; label: string; emphasis: 'primary' | 'secondary' | 'quiet' | 'danger'; dialog?: string; screen?: string }

interface RecordOptions {
    name: string;
    entity: WorkOrdersEntityKind;
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
    const queries = workOrdersQueriesOf(options.entity);
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
        metadata: workOrdersMetadata(options.name, 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
    };
}

/** The work order page: the work order number as its title, its status, priority, days to its due date and hours logged at the top, its details, tasks, parts and time in the main region, and the activity beside it. */
export const workOrderPageTemplate = recordPageOf({
    name: 'WorkOrderPage', entity: WorkOrdersEntityKind.WorkOrder, displayName: 'Work order page', description: 'One work order: status, priority, days to its due date and hours logged, its details, tasks, parts and time, and its activity.', titleField: 'number', backScreen: 'workorders.list', backLabel: 'Back to work orders',
    facts: [
        { id: 'priority', label: 'Priority', field: 'priority' },
        { id: 'days', label: 'Days to due date', field: 'daysToDue' },
        { id: 'hours', label: 'Hours logged', field: 'hoursLogged' },
    ],
    extras: [{ key: 'Tasks', label: 'Tasks', titleField: 'task' }, { key: 'Parts', label: 'Parts used', titleField: 'part' }, { key: 'Time', label: 'Time logged', titleField: 'technician' }],
    actions: [],
});
