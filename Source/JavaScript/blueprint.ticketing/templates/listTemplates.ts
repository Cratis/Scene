// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionActionKind, InteractionTriggerKind, NotificationLevel, NotifyAction, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { boardScreenTemplate, listScreenTemplate } from '@cratis/scene.blueprint.default';
import { TicketingQuery, fromQuery, localeOfData } from '../ticketingQueries';
import { actionButton, component, opensDialog, opensRecordOnSelect, ticketingMetadata, withBehaviors } from '../ticketingParts';

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
    newLabel: string;
    quickCreate: string;
    rows: string;
    columns: string;
    filterFields: string;
    views: string;
    columnChoices: string;
    selection: string;
    rowActions: string[];
    bulkActions: string[];
    recordScreen?: string;
}

/**
 * One help-desk list: the foundation `ListScreen` with its header, toolbar, filters, list and bulk bar filled. The slots, arrangement and every behavior -
 * sort, search, paging and selection in the address, the table collapsing to cards on a phone - are the foundation's.
 */
function listTemplateOf(options: ListOptions): ScreenTemplate {
    const id = options.name;
    const listId = `${id}-records`;
    const list = component(listId, 'dataList', {
        label: options.title, rows: fromQuery(options.rows), columns: fromQuery(options.columns), titleField: 'subject', pageSize: 10, rowActions: options.rowActions, urlKey: options.urlKey,
        selectionMode: options.recordScreen ? 'single' : 'multiple', ...localeOfData,
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
                component(`${id}-views`, 'savedViewsMenu', { views: fromQuery(options.views), savePermission: 'enabled', managePermission: 'enabled' }),
                component(`${id}-columns`, 'columnChooser', { columns: fromQuery(options.columnChoices) }),
            ],
            filters: [component(`${id}-filter`, 'filterBuilder', { fields: fromQuery(options.filterFields), ...localeOfData })],
            list: [options.recordScreen ? withBehaviors(list, opensRecordOnSelect(listId, options.recordScreen)) : list],
            bulkBar: options.recordScreen ? [] : [component(`${id}-bulk`, 'bulkBar', { selection: fromQuery(options.selection), actions: options.bulkActions })],
            footer: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: ticketingMetadata(options.name, 'List', listScopes),
    };
}

/** The ticket queue: id, subject, requester, priority, status, assignee and age, with the saved views Unassigned, Mine and Overdue. Choosing a ticket opens it. */
export const ticketQueueTemplate = listTemplateOf({
    name: 'TicketQueue', displayName: 'Ticket queue', description: 'Every ticket with its priority and status as chips, filtered by status, priority, assignee and age, with the saved views Unassigned, Mine and Overdue.',
    title: 'Queue', subtitle: 'Every open ticket, oldest first', searchLabel: 'Search tickets', urlKey: 'tickets', newLabel: 'New ticket', quickCreate: 'TicketQuickCreate',
    rows: TicketingQuery.Tickets, columns: TicketingQuery.TicketColumns, filterFields: TicketingQuery.TicketFilterFields, views: TicketingQuery.TicketViews, columnChoices: TicketingQuery.TicketColumnChoices,
    selection: TicketingQuery.TicketSelection, rowActions: ['Assign', 'Change status', 'Escalate'], bulkActions: ['Assign', 'Close'], recordScreen: 'support.queue.ticket',
});

/** The agent's own tickets: the same rows narrowed to the signed-in agent, so the assignee column is left out. */
export const myTicketsTemplate = listTemplateOf({
    name: 'MyTickets', displayName: 'My tickets', description: 'The tickets assigned to the signed-in agent, with their priority and status as chips and how long each has waited.',
    title: 'My tickets', subtitle: 'Assigned to me', searchLabel: 'Search my tickets', urlKey: 'mine', newLabel: 'New ticket', quickCreate: 'TicketQuickCreate',
    rows: TicketingQuery.MyTickets, columns: TicketingQuery.MyTicketColumns, filterFields: TicketingQuery.TicketFilterFields, views: TicketingQuery.TicketViews, columnChoices: TicketingQuery.TicketColumnChoices,
    selection: TicketingQuery.TicketSelection, rowActions: ['Change status', 'Escalate'], bulkActions: ['Close'], recordScreen: 'support.queue.ticket',
});

/** The customers: who writes in, from which organisation, and how many tickets they have open. */
export const customerListTemplate = listTemplateOf({
    name: 'CustomerList', displayName: 'Customers', description: 'The people and organisations that write in, with their plan, how many tickets they have open and when they last wrote.',
    title: 'Customers', subtitle: 'The people and organisations you support', searchLabel: 'Search customers', urlKey: 'customers', newLabel: 'New customer', quickCreate: 'CustomerQuickCreate',
    rows: TicketingQuery.Customers, columns: TicketingQuery.CustomerColumns, filterFields: TicketingQuery.CustomerFilterFields, views: TicketingQuery.CustomerViews, columnChoices: TicketingQuery.CustomerColumnChoices,
    selection: TicketingQuery.CustomerSelection, rowActions: ['Edit', 'Merge', 'Delete'], bulkActions: ['Merge', 'Delete'],
});

/** The queue board: a column for each status, a card for each ticket with its id, subject, requester, priority and assignee. A ticket moves by dragging or by its own Move-to menu. */
export const ticketBoardTemplate: ScreenTemplate = {
    name: 'TicketBoard',
    fitsSlot: 'content',
    slots: boardScreenTemplate.slots,
    arrangement: boardScreenTemplate.arrangement,
    content: {
        header: [component('board-header', 'pageHeader', { title: 'Queue board', subtitle: 'Drag a ticket to a new status' }, {
            actions: [withBehaviors(actionButton('board-new', 'New ticket', 'primary'), opensDialog('TicketQuickCreate'))],
        })],
        toolbar: [
            component('board-search', 'globalSearch', { placeholder: 'Search the board', label: 'Search the board' }),
            component('board-views', 'savedViewsMenu', { views: fromQuery(TicketingQuery.TicketViews), savePermission: 'enabled', managePermission: 'enabled' }),
        ],
        board: [component('board-tickets', 'kanbanBoard', {
            columns: fromQuery(TicketingQuery.BoardStatuses), cards: fromQuery(TicketingQuery.BoardTickets), editPermission: 'enabled', label: 'Tickets by status', ...localeOfData,
        })],
    },
    displayName: 'Ticket queue board',
    description: 'Tickets as cards in a column for each status.',
    metadata: ticketingMetadata('TicketBoard', 'Board', listScopes),
};
