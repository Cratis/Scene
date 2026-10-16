// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind } from '@cratis/scene.model';

/**
 * A property taken from a query result - never a value. A CRM template declares *where* its data comes from and the sample-data pack, or the real
 * query, supplies the rows (spec SD1); `path` reaches into the result (`0.value` is the first row's `value`, an empty path is the whole result).
 */
export const fromQuery = (query: string, path = ''): BindingExpression => ({ kind: BindingSourceKind.QueryResult, query, path });

/** The queries of the dashboard. Each is a shape the sample-data packs supply rows for. */
export const CrmQuery = {
    /** One row: the `locale` the figures and dates are formatted in and the `currency` of the amounts. */
    Settings: 'CrmSettings',
    Kpis: 'CrmKpis',
    LeadsBySource: 'CrmLeadsBySource',
    DealsByStage: 'CrmDealsByStage',
    MyTasks: 'CrmMyTasks',
    ClosingSoon: 'ClosingSoonDeals',
    RecordTabs: 'CrmRecordTabs',
    PipelineStages: 'PipelineStages',
    PipelineDeals: 'PipelineDeals',
    FormErrors: 'CrmFormErrors',
} as const;

/** The CRM entities a template is made for. */
export enum CrmEntityKind {
    Lead = 'Lead',
    Contact = 'Contact',
    Company = 'Company',
    Deal = 'Deal',
    Activity = 'Activity',
}

/** The plural of each entity: the read model (and so the shape) its records are queried from. */
export const crmEntityPlural: Record<CrmEntityKind, string> = {
    [CrmEntityKind.Lead]: 'Leads',
    [CrmEntityKind.Contact]: 'Contacts',
    [CrmEntityKind.Company]: 'Companies',
    [CrmEntityKind.Deal]: 'Deals',
    [CrmEntityKind.Activity]: 'Activities',
};

/**
 * The queries one entity's templates bind to, named from the entity so a template never spells one out: the records, the columns and filter fields of the
 * list, its saved views and column choices, the selection, the sections of the full and the quick form, and the record the page and the edit form show.
 */
export const crmQueriesOf = (entity: CrmEntityKind) => ({
    rows: crmEntityPlural[entity],
    columns: `${entity}Columns`,
    filterFields: `${entity}FilterFields`,
    views: `${entity}Views`,
    columnChoices: `${entity}ColumnChoices`,
    selection: `${entity}Selection`,
    sections: `${entity}Sections`,
    quickSections: `${entity}QuickSections`,
    record: `${entity}Record`,
    related: (other: CrmEntityKind) => `${entity}${crmEntityPlural[other]}`,
    activity: `${entity}Activity`,
    tasks: `${entity}Tasks`,
    summary: `${entity}Summary`,
});

/** The locale and currency of the data, bound onto every component that formats a figure or a date. */
export const localeOfData = { locale: fromQuery(CrmQuery.Settings, '0.locale') };
export const currencyOfData = { ...localeOfData, currency: fromQuery(CrmQuery.Settings, '0.currency') };
