// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, NotificationLevel, NotifyAction, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { boardScreenTemplate, listScreenTemplate } from '@cratis/scene.blueprint.default';
import { CrmEntityKind, CrmQuery, crmQueriesOf, currencyOfData, fromQuery, localeOfData } from '../crmQueries';
import { actionButton, component, crmMetadata, opensDialog, opensRecordOnSelect, withBehaviors } from '../crmParts';

const listScopes = [TemplateScope.Module, TemplateScope.Feature];

/** The Export button: it tells the user the export has started, which is what the shell does for a long-running action it does not wait on. */
const exportAction = (id: string) => withBehaviors(actionButton(id, 'Export', 'secondary'), [{
    bindings: [{
        trigger: { kind: InteractionTriggerKind.Click },
        actions: [{ kind: InteractionActionKind.Notify, level: NotificationLevel.Info, message: { text: 'The export has started.' } } as unknown as NotifyAction],
    }],
}]);

interface ListOptions {
    name: string;
    entity: CrmEntityKind;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    urlKey: string;
    newLabel: string;
    quickCreate: string;
    rowActions: string[];
    bulkActions: string[];
    /** The screen a chosen row opens; the list then selects one row at a time. Absent, rows are selected many at a time for the bulk bar. */
    recordScreen?: string;
    /** Group the rows (`variant: grouped`) by this field with subtotals of `totalField`. */
    grouped?: { groupBy: string; totalField: string };
}

/**
 * One CRM list: the foundation `ListScreen` with its header, toolbar, filters, list and bulk bar filled for an entity. The slots, arrangement and
 * every behavior - sort, search, paging and selection in the address, the table collapsing to cards on a phone - are the foundation's.
 */
function listTemplateOf(options: ListOptions): ScreenTemplate {
    const queries = crmQueriesOf(options.entity);
    const id = options.name;
    const listId = `${id}-records`;
    const list = component(listId, 'dataList', {
        label: options.title, rows: fromQuery(queries.rows), columns: fromQuery(queries.columns), titleField: 'name', pageSize: 10, rowActions: options.rowActions, urlKey: options.urlKey,
        selectionMode: options.recordScreen ? 'single' : 'multiple', ...localeOfData,
        ...(options.grouped ? { variant: 'grouped', groupBy: options.grouped.groupBy, totalField: options.grouped.totalField } : {}),
    });

    return {
        name: options.name,
        fitsSlot: 'content',
        slots: listScreenTemplate.slots,
        arrangement: listScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, {
                actions: [exportAction(`${id}-export`), withBehaviors(actionButton(`${id}-new`, options.newLabel, 'primary'), opensDialog(options.quickCreate))],
            })],
            toolbar: [
                component(`${id}-search`, 'globalSearch', { placeholder: options.searchLabel, label: options.searchLabel, urlKey: `${options.urlKey}q` }),
                component(`${id}-views`, 'savedViewsMenu', { views: fromQuery(queries.views), savePermission: 'enabled', managePermission: 'enabled' }),
                component(`${id}-columns`, 'columnChooser', { columns: fromQuery(queries.columnChoices) }),
            ],
            filters: [component(`${id}-filter`, 'filterBuilder', { fields: fromQuery(queries.filterFields), ...localeOfData })],
            list: [options.recordScreen ? withBehaviors(list, opensRecordOnSelect(listId, options.recordScreen)) : list],
            bulkBar: options.recordScreen ? [] : [component(`${id}-bulk`, 'bulkBar', { selection: fromQuery(queries.selection), actions: options.bulkActions })],
            footer: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: crmMetadata(options.name, 'List', listScopes),
    };
}

/** The leads: new, contacted and qualified prospects, with the row actions a sales team works them with, including converting a lead into a contact, a company and a deal. */
export const crmLeadListTemplate = listTemplateOf({
    name: 'CrmLeadList', entity: CrmEntityKind.Lead, displayName: 'CRM leads', description: 'Leads with their company, owner, status and last contact, filtered by owner, status, source and creation date.',
    title: 'Leads', subtitle: 'Prospects who have not yet become contacts', searchLabel: 'Search leads', urlKey: 'leads', newLabel: 'New lead', quickCreate: 'CrmQuickCreateLead',
    rowActions: ['Edit', 'Assign', 'Convert', 'Delete'], bulkActions: ['Assign', 'Delete'],
});

/** The contacts: the people at the companies a team sells to. Choosing a row opens the contact. */
export const crmContactListTemplate = listTemplateOf({
    name: 'CrmContactList', entity: CrmEntityKind.Contact, displayName: 'CRM contacts', description: 'Contacts with their company, owner, status and last contact, filtered by owner, status, source and creation date.',
    title: 'Contacts', subtitle: 'The people you sell to', searchLabel: 'Search contacts', urlKey: 'contacts', newLabel: 'New contact', quickCreate: 'CrmQuickCreateContact',
    rowActions: ['Edit', 'Assign', 'Delete'], bulkActions: ['Assign', 'Delete'], recordScreen: 'crm.contacts.record',
});

/** The companies: the accounts a team sells to. Choosing a row opens the company. */
export const crmCompanyListTemplate = listTemplateOf({
    name: 'CrmCompanyList', entity: CrmEntityKind.Company, displayName: 'CRM companies', description: 'Companies with their industry, owner, status and last contact, filtered by owner, status, source and creation date.',
    title: 'Companies', subtitle: 'The accounts you sell to', searchLabel: 'Search companies', urlKey: 'companies', newLabel: 'New company', quickCreate: 'CrmQuickCreateCompany',
    rowActions: ['Edit', 'Assign', 'Delete'], bulkActions: ['Assign', 'Delete'], recordScreen: 'crm.companies.record',
});

/** The deals as a table, grouped by stage with the value of each stage as its subtotal. Choosing a row opens the deal. */
export const crmDealListTemplate = listTemplateOf({
    name: 'CrmDealList', entity: CrmEntityKind.Deal, displayName: 'CRM deals list', description: 'Every deal as a table grouped by stage, with the value of each stage as its subtotal.',
    title: 'Deals', subtitle: 'Every deal, grouped by stage', searchLabel: 'Search deals', urlKey: 'deals', newLabel: 'New deal', quickCreate: 'CrmQuickCreateDeal',
    rowActions: ['Edit', 'Assign', 'Delete'], bulkActions: ['Assign', 'Delete'], recordScreen: 'crm.deals.record', grouped: { groupBy: 'stage', totalField: 'value' },
});

/** The activities: calls, meetings, emails and tasks, with who did them and for whom. */
export const crmActivityListTemplate = listTemplateOf({
    name: 'CrmActivityList', entity: CrmEntityKind.Activity, displayName: 'CRM activities', description: 'Calls, meetings, emails and tasks with their owner, status and date.',
    title: 'Activities', subtitle: 'What the team has done and has yet to do', searchLabel: 'Search activities', urlKey: 'activities', newLabel: 'Log activity', quickCreate: 'CrmQuickCreateActivity',
    rowActions: ['Edit', 'Complete', 'Delete'], bulkActions: ['Complete', 'Delete'],
});

/**
 * The deals pipeline: the foundation `BoardScreen` with a column for each stage, each header showing what the stage is worth, and a card for each deal with
 * its name, company, value, close date and owner. A deal moves to another stage by dragging or by its own Move-to menu.
 */
export const crmDealPipelineTemplate: ScreenTemplate = {
    name: 'CrmDealPipeline',
    fitsSlot: 'content',
    slots: boardScreenTemplate.slots,
    arrangement: boardScreenTemplate.arrangement,
    content: {
        header: [component('pipeline-header', 'pageHeader', { title: 'Pipeline', subtitle: 'Drag a deal to a new stage' }, {
            actions: [withBehaviors(actionButton('pipeline-new', 'New deal', 'primary'), opensDialog('CrmQuickCreateDeal'))],
        })],
        toolbar: [
            component('pipeline-search', 'globalSearch', { placeholder: 'Search the pipeline', label: 'Search the pipeline' }),
            component('pipeline-views', 'savedViewsMenu', { views: fromQuery(crmQueriesOf(CrmEntityKind.Deal).views), savePermission: 'enabled', managePermission: 'enabled' }),
        ],
        board: [component('pipeline-board', 'kanbanBoard', {
            columns: fromQuery(CrmQuery.PipelineStages), cards: fromQuery(CrmQuery.PipelineDeals), totalField: 'amount', format: 'currency', editPermission: 'enabled', label: 'Deals by stage', ...currencyOfData,
        })],
    },
    displayName: 'CRM deals pipeline',
    description: 'Deals as cards in a column for each stage, each stage showing its total value.',
    metadata: crmMetadata('CrmDealPipeline', 'Board', listScopes),
};
