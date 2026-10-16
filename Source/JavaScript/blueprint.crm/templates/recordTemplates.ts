// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, SceneElement, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { CrmEntityKind, CrmQuery, crmEntityPlural, crmQueriesOf, currencyOfData, fromQuery, localeOfData } from '../crmQueries';
import { actionButton, component, crmMetadata, goesTo, withBehaviors } from '../crmParts';

const recordScopes = [TemplateScope.Feature, TemplateScope.Subfeature];

interface RecordOptions {
    name: string;
    entity: CrmEntityKind;
    displayName: string;
    description: string;
    subtitle: string;
    editScreen: string;
    /** The key facts shown under the header: figures, the status and the people. */
    summary: SceneElement[];
    /** The related lists, each a query of records of another entity. */
    related: { entity: CrmEntityKind; label: string }[];
}

/**
 * One CRM record page: the foundation `RecordPage` with the record's name as its title and an Edit action, its key facts under it, tabs, the record's fields,
 * the related lists of other entities and the record's activity. The tabs, the activity and the aside are the foundation's.
 */
function recordTemplateOf(options: RecordOptions): ScreenTemplate {
    const id = options.name;
    const queries = crmQueriesOf(options.entity);

    return {
        name: options.name,
        fitsSlot: 'content',
        slots: recordPageTemplate.slots,
        arrangement: recordPageTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: fromQuery(queries.record, '0.name'), subtitle: options.subtitle }, {
                actions: [withBehaviors(actionButton(`${id}-edit`, 'Edit', 'primary'), goesTo(options.editScreen))],
            })],
            summary: options.summary,
            tabs: [component(`${id}-tabs`, 'tabSet', { tabs: fromQuery(CrmQuery.RecordTabs), urlKey: 'tab', label: `${options.entity} sections` })],
            main: [component(`${id}-form`, 'formScreenBody', { mode: 'readOnly', sections: fromQuery(queries.sections), values: fromQuery(queries.record, '0'), ...localeOfData })],
            related: options.related.map(related => component(`${id}-related-${crmEntityPlural[related.entity].toLowerCase()}`, 'dataList', {
                label: related.label, rows: fromQuery(queries.related(related.entity)), columns: fromQuery(crmQueriesOf(related.entity).columns), titleField: 'name', pageSize: 5, ...localeOfData,
            })),
            activity: [component(`${id}-activity`, 'activityFeed', { label: 'Activity', entries: fromQuery(queries.activity), ...localeOfData })],
            aside: [component(`${id}-tasks`, 'checklistSection', { label: 'Next steps', sections: fromQuery(queries.tasks), ...localeOfData })],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: crmMetadata(options.name, 'Detail', recordScopes),
    };
}

const summaryChip = (id: string, query: string) => component(`${id}-status`, 'statusChip', { status: fromQuery(query, '0.status'), tone: fromQuery(query, '0.tone') });
const summaryFigure = (id: string, name: string, label: string, query: string, field: string, currency: boolean) =>
    component(`${id}-${name}`, 'statCard', { label, value: fromQuery(query, `0.${field}`), ...(currency ? { format: 'currency', fractionDigits: 0, ...currencyOfData } : localeOfData) });
const summaryPeople = (id: string, query: string) => component(`${id}-owners`, 'avatarStack', { people: fromQuery(query, '0.people') });

/** The contact page: who the contact is and where, the deals they are part of, and everything that has happened with them. */
export const crmContactPageTemplate = recordTemplateOf({
    name: 'CrmContactPage', entity: CrmEntityKind.Contact, displayName: 'CRM contact page', description: 'One contact: key facts, their fields, their deals and the activity with them.',
    subtitle: 'Contact', editScreen: 'crm.contacts.edit',
    summary: [
        summaryChip('crm-contact', crmQueriesOf(CrmEntityKind.Contact).summary),
        summaryFigure('crm-contact', 'deals', 'Open deals', crmQueriesOf(CrmEntityKind.Contact).summary, 'openDeals', false),
        summaryFigure('crm-contact', 'value', 'Lifetime value', crmQueriesOf(CrmEntityKind.Contact).summary, 'lifetimeValue', true),
        summaryPeople('crm-contact', crmQueriesOf(CrmEntityKind.Contact).summary),
    ],
    related: [{ entity: CrmEntityKind.Deal, label: 'Deals of this contact' }],
});

/** The company page: the account, the contacts who work there, and the deals with it. */
export const crmCompanyPageTemplate = recordTemplateOf({
    name: 'CrmCompanyPage', entity: CrmEntityKind.Company, displayName: 'CRM company page', description: 'One company: key facts, its fields, its contacts and deals and the activity with it.',
    subtitle: 'Company', editScreen: 'crm.companies.edit',
    summary: [
        summaryChip('crm-company', crmQueriesOf(CrmEntityKind.Company).summary),
        summaryFigure('crm-company', 'contacts', 'Contacts', crmQueriesOf(CrmEntityKind.Company).summary, 'contacts', false),
        summaryFigure('crm-company', 'deals', 'Open deals', crmQueriesOf(CrmEntityKind.Company).summary, 'openDeals', false),
        summaryFigure('crm-company', 'value', 'Lifetime value', crmQueriesOf(CrmEntityKind.Company).summary, 'lifetimeValue', true),
        summaryPeople('crm-company', crmQueriesOf(CrmEntityKind.Company).summary),
    ],
    related: [{ entity: CrmEntityKind.Contact, label: 'Contacts at this company' }, { entity: CrmEntityKind.Deal, label: 'Deals with this company' }],
});

/** The deal page: where the deal is, what it is worth, who is involved, and the history of getting there. */
export const crmDealPageTemplate = recordTemplateOf({
    name: 'CrmDealPage', entity: CrmEntityKind.Deal, displayName: 'CRM deal page', description: 'One deal: stage, value and close date, its fields, the contacts involved and the activity on it.',
    subtitle: 'Deal', editScreen: 'crm.deals.edit',
    summary: [
        summaryChip('crm-deal', crmQueriesOf(CrmEntityKind.Deal).summary),
        summaryFigure('crm-deal', 'value', 'Value', crmQueriesOf(CrmEntityKind.Deal).summary, 'value', true),
        summaryFigure('crm-deal', 'probability', 'Probability', crmQueriesOf(CrmEntityKind.Deal).summary, 'probability', false),
        summaryPeople('crm-deal', crmQueriesOf(CrmEntityKind.Deal).summary),
    ],
    related: [{ entity: CrmEntityKind.Contact, label: 'Contacts on this deal' }],
});
