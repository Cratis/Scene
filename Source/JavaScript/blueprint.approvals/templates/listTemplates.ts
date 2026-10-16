// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, NotificationLevel, NotifyAction, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { listScreenTemplate } from '@cratis/scene.blueprint.default';
import { ApprovalsQuery, fromQuery, localeOfData } from '../approvalsQueries';
import { actionButton, approvalsMetadata, component, goesTo, opensDialog, opensRecordOnSelect, withBehaviors } from '../approvalsParts';

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
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    urlKey: string;
    rows: string;
    columns: string;
    filterFields: string;
    views: string;
    columnChoices?: string;
    selection?: string;
    rowActions: string[];
    bulkActions?: string[];
    recordScreen?: string;

    /** The primary button of the header: its label and what it does. */
    primary?: { label: string; behaviors: ReturnType<typeof goesTo> };

    /** Draw the rows as cards with their actions as buttons, as an approver decides. */
    decide?: boolean;
}

/**
 * One approvals list: the foundation `ListScreen` with its header, toolbar, filters, list and bulk bar filled. The slots, arrangement and every behavior -
 * sort, search, paging and selection in the address, the table collapsing to cards on a phone - are the foundation's.
 */
function listTemplateOf(options: ListOptions): ScreenTemplate {
    const id = options.name;
    const listId = `${id}-records`;
    const list = component(listId, 'dataList', {
        label: options.title, rows: fromQuery(options.rows), columns: fromQuery(options.columns), titleField: 'title', pageSize: options.decide ? 6 : 10, rowActions: options.rowActions, urlKey: options.urlKey,
        ...(options.decide ? { variant: 'cards', rowActionStyle: 'buttons', toneField: 'tone' } : {}),
        selectionMode: options.recordScreen || options.decide ? 'single' : 'multiple', ...localeOfData,
    });
    const toolbar = [
        component(`${id}-search`, 'globalSearch', { placeholder: options.searchLabel, label: options.searchLabel, urlKey: `${options.urlKey}q` }),
        component(`${id}-views`, 'savedViewsMenu', { views: fromQuery(options.views), savePermission: 'enabled', managePermission: 'enabled' }),
        ...(options.columnChoices ? [component(`${id}-columns`, 'columnChooser', { columns: fromQuery(options.columnChoices) })] : []),
    ];

    return {
        name: options.name,
        fitsSlot: 'content',
        slots: listScreenTemplate.slots,
        arrangement: listScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, {
                actions: [exportAction(`${id}-export`), ...(options.primary ? [withBehaviors(actionButton(`${id}-primary`, options.primary.label, 'primary'), options.primary.behaviors)] : [])],
            })],
            toolbar,
            filters: [component(`${id}-filter`, 'filterBuilder', { fields: fromQuery(options.filterFields), ...localeOfData })],
            list: [options.recordScreen ? withBehaviors(list, opensRecordOnSelect(listId, options.recordScreen)) : options.decide ? withBehaviors(list, opensDialog('DecisionDialog')) : list],
            bulkBar: options.bulkActions && options.selection && !options.recordScreen && !options.decide ? [component(`${id}-bulk`, 'bulkBar', { selection: fromQuery(options.selection), actions: options.bulkActions })] : [],
            footer: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: approvalsMetadata(options.name, 'List', listScopes),
    };
}

/**
 * The approval inbox: the requests waiting for the signed-in person as cards (the foundation list's Cards variant), each with its type, who asked, the amount or
 * dates, how long it has waited and **Approve, Reject and Request changes as buttons on the card**. Pressing one opens the decision dialog for that decision,
 * so a decision always carries a comment. A card's tone says how overdue it is, and the words say the same.
 */
export const approvalInboxTemplate = listTemplateOf({
    name: 'ApprovalInbox', displayName: 'Approval inbox', description: 'The requests waiting for my decision as cards, with Approve, Reject and Request changes inline.',
    title: 'Inbox', subtitle: 'Waiting for your decision', searchLabel: 'Search the inbox', urlKey: 'inbox', rows: ApprovalsQuery.Inbox, columns: ApprovalsQuery.InboxColumns,
    filterFields: ApprovalsQuery.InboxFilterFields, views: ApprovalsQuery.InboxViews, rowActions: ['Approve', 'Reject', 'Request changes'], decide: true,
});

/** The requests I made: draft, submitted, approved and rejected as chips, and a New request button that starts the wizard. Choosing a request opens it. */
export const myRequestsTemplate = listTemplateOf({
    name: 'MyRequests', displayName: 'My requests', description: 'The requests I made, with draft, submitted, approved and rejected as chips.',
    title: 'My requests', subtitle: 'What I asked for and where it stands', searchLabel: 'Search my requests', urlKey: 'requests',
    rows: ApprovalsQuery.MyRequests, columns: ApprovalsQuery.MyRequestColumns, filterFields: ApprovalsQuery.MyRequestFilterFields, views: ApprovalsQuery.MyRequestViews, columnChoices: ApprovalsQuery.MyRequestColumnChoices,
    selection: ApprovalsQuery.MyRequestSelection, rowActions: ['Withdraw', 'Delete draft'], bulkActions: ['Withdraw'], recordScreen: 'approvals.requests.page', primary: { label: 'New request', behaviors: goesTo('approvals.requests.new') },
});

/** Every request of the organisation, with who asked, who decides and where each stands. */
export const allRequestsTemplate = listTemplateOf({
    name: 'AllRequests', displayName: 'All requests', description: 'Every request of the organisation with its type, requester, current approver and status.',
    title: 'All requests', subtitle: 'Every request in the organisation', searchLabel: 'Search all requests', urlKey: 'all',
    rows: ApprovalsQuery.AllRequests, columns: ApprovalsQuery.AllRequestColumns, filterFields: ApprovalsQuery.AllRequestFilterFields, views: ApprovalsQuery.AllRequestViews, columnChoices: ApprovalsQuery.AllRequestColumnChoices,
    selection: ApprovalsQuery.AllRequestSelection, rowActions: ['Reassign', 'Cancel'], bulkActions: ['Reassign', 'Cancel'], recordScreen: 'approvals.requests.page',
});

/** The request types an organisation offers: what each asks for, how many steps approve it and whether it is active. For administrators. Choosing one edits it. */
export const requestTypesTemplate = listTemplateOf({
    name: 'RequestTypes', displayName: 'Request types', description: 'The request types an organisation offers, with the steps that approve each and whether it is active.',
    title: 'Templates', subtitle: 'The request types people can choose from', searchLabel: 'Search request types', urlKey: 'types',
    rows: ApprovalsQuery.RequestTypes, columns: ApprovalsQuery.RequestTypeColumns, filterFields: ApprovalsQuery.RequestTypeFilterFields, views: ApprovalsQuery.RequestTypeViews, columnChoices: ApprovalsQuery.RequestTypeColumnChoices,
    selection: ApprovalsQuery.RequestTypeSelection, rowActions: ['Duplicate', 'Deactivate'], bulkActions: ['Deactivate'], recordScreen: 'approvals.templates.edit', primary: { label: 'New request type', behaviors: opensDialog('RequestTypeQuickCreate') },
});
