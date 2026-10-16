// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind } from '@cratis/scene.model';

/**
 * A property taken from a query result - never a value. An HR template declares *where* its data comes from and the sample-data pack, or the real
 * query, supplies the rows (spec SD1); `path` reaches into the result (`0.value` is the first row's `value`, an empty path is the whole result).
 */
export const fromQuery = (query: string, path = ''): BindingExpression => ({ kind: BindingSourceKind.QueryResult, query, path });

/** The queries of the screens that are not a plain list. Each is a shape the sample-data pack supplies rows for. */
export const HrQuery = {
    /** One row: the `locale` the figures and dates are formatted in. */
    Settings: 'HrSettings',
    RecordTabs: 'HrRecordTabs',
    OrgNodes: 'OrgNodes',
    FormErrors: 'HrFormErrors',
} as const;

/** The HR entities a template is made for. */
export enum HrEntityKind {
    Employee = 'Employee',
    TimeOff = 'TimeOff',
    Balance = 'Balance',
    Onboarding = 'Onboarding',
}

/** The read model (and so the shape) the records of each entity are queried from. */
export const hrEntityPlural: Record<HrEntityKind, string> = {
    [HrEntityKind.Employee]: 'Employees',
    [HrEntityKind.TimeOff]: 'TimeOffRequests',
    [HrEntityKind.Balance]: 'Balances',
    [HrEntityKind.Onboarding]: 'Onboardings',
};

/**
 * The queries one entity's templates bind to, named from the entity so a template never spells one out: the records, the columns and filter fields of the
 * list, its saved views and column choices, the selection, the sections of the full and the quick form, and the record the page shows.
 */
export const hrQueriesOf = (entity: HrEntityKind) => ({
    rows: hrEntityPlural[entity],
    columns: `${entity}Columns`,
    filterFields: `${entity}FilterFields`,
    views: `${entity}Views`,
    columnChoices: `${entity}ColumnChoices`,
    selection: `${entity}Selection`,
    sections: `${entity}Sections`,
    quickSections: `${entity}QuickSections`,
    record: `${entity}Record`,
    summary: `${entity}Summary`,
    documents: `${entity}Documents`,
    activity: `${entity}Activity`,
    tasks: `${entity}Tasks`,
});

/** The locale and currency of the data, bound onto every component that formats a figure or a date. */
export const localeOfData = { locale: fromQuery(HrQuery.Settings, '0.locale') };
export const currencyOfData = { ...localeOfData, currency: fromQuery(HrQuery.Settings, '0.currency') };
