// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`crm.leads.new` is the `new` feature of `leads` in the `crm` module). */
export interface CrmScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const crmScreenDefinitions: CrmScreenDefinition[] = [
    { name: 'crm.dashboard', title: 'Dashboard', template: 'CrmDashboard', order: 0, description: 'Open pipeline, wins, conversion, leads by source and deals by stage.' },
    { name: 'crm.leads', title: 'Leads', template: 'CrmLeadList', order: 1, description: 'Every lead, filtered and worked from one list.' },
    { name: 'crm.leads.new', title: 'New lead', template: 'CrmLeadCreateForm', parent: 'crm.leads', description: 'Creates a lead.' },
    { name: 'crm.leads.edit', title: 'Edit lead', template: 'CrmLeadEditForm', parent: 'crm.leads', description: 'Edits a lead.' },
    { name: 'crm.contacts', title: 'Contacts', template: 'CrmContactList', order: 2, description: 'Every contact, filtered and worked from one list.' },
    { name: 'crm.contacts.record', title: 'Contact', template: 'CrmContactPage', parent: 'crm.contacts', description: 'One contact with their deals and activity.' },
    { name: 'crm.contacts.new', title: 'New contact', template: 'CrmContactCreateForm', parent: 'crm.contacts', description: 'Creates a contact.' },
    { name: 'crm.contacts.edit', title: 'Edit contact', template: 'CrmContactEditForm', parent: 'crm.contacts', description: 'Edits a contact.' },
    { name: 'crm.companies', title: 'Companies', template: 'CrmCompanyList', order: 3, description: 'Every company, filtered and worked from one list.' },
    { name: 'crm.companies.record', title: 'Company', template: 'CrmCompanyPage', parent: 'crm.companies', description: 'One company with its contacts, deals and activity.' },
    { name: 'crm.companies.new', title: 'New company', template: 'CrmCompanyCreateForm', parent: 'crm.companies', description: 'Creates a company.' },
    { name: 'crm.companies.edit', title: 'Edit company', template: 'CrmCompanyEditForm', parent: 'crm.companies', description: 'Edits a company.' },
    { name: 'crm.deals', title: 'Deals pipeline', template: 'CrmDealPipeline', order: 4, description: 'Deals in a column for each stage, with the value of each stage.' },
    { name: 'crm.deals.list', title: 'Deals list', template: 'CrmDealList', parent: 'crm.deals', order: 0, description: 'Every deal as a table grouped by stage.' },
    { name: 'crm.deals.record', title: 'Deal', template: 'CrmDealPage', parent: 'crm.deals', description: 'One deal with its contacts and activity.' },
    { name: 'crm.deals.new', title: 'New deal', template: 'CrmDealCreateForm', parent: 'crm.deals', description: 'Creates a deal.' },
    { name: 'crm.deals.edit', title: 'Edit deal', template: 'CrmDealEditForm', parent: 'crm.deals', description: 'Edits a deal.' },
    { name: 'crm.activities', title: 'Activities', template: 'CrmActivityList', order: 5, description: 'Calls, meetings, emails and tasks.' },
];
