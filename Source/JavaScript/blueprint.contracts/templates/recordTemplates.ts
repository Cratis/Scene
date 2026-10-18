// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { ContractsEntityKind, currencyOfData, fromQuery, localeOfData, contractsQueriesOf } from '../contractsQueries';
import { actionButton, component, goesTo, contractsMetadata, opensDialog, withBehaviors } from '../contractsParts';

interface Fact { id: string; label: string; field: string; format?: 'currency' | 'percent' }
interface Extra { key: string; label: string; titleField: string; pageSize?: number }
interface Action { id: string; label: string; emphasis: 'primary' | 'secondary' | 'quiet' | 'danger'; dialog?: string; screen?: string }

interface RecordOptions {
    name: string;
    entity: ContractsEntityKind;
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
    const queries = contractsQueriesOf(options.entity);
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
        metadata: contractsMetadata(options.name, 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
    };
}

/** The contract page: the contract number as its title, its status, value, days to its end and notice period at the top, its details, parties, obligations and amendments in the main region, and the activity beside it. */
export const contractPageTemplate = recordPageOf({
    name: 'ContractPage', entity: ContractsEntityKind.Contract, displayName: 'Contract page', description: 'One contract: status, value, days to its end and notice period, its details, parties, obligations and amendments, and its activity.', titleField: 'number', backScreen: 'contracts.list', backLabel: 'Back to contracts',
    facts: [
        { id: 'value', label: 'Contract value', field: 'value', format: 'currency' },
        { id: 'days', label: 'Days to end', field: 'daysToEnd' },
        { id: 'notice', label: 'Notice (days)', field: 'noticeDays' },
    ],
    extras: [{ key: 'Parties', label: 'Parties', titleField: 'name' }, { key: 'Obligations', label: 'Obligations', titleField: 'summary' }, { key: 'Amendments', label: 'Amendments', titleField: 'number' }],
    actions: [],
});
