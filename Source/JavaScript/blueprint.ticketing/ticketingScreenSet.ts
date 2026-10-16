// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`support.queue.board` is the `board` feature of `queue` in the `support` module). */
export interface TicketingScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;

    /** The layout the screen is drawn in: the application shell, or the full page for the public portal. */
    layout: 'AppShell' | 'FullPage';
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const ticketingScreenDefinitions: TicketingScreenDefinition[] = [
    { name: 'support.dashboard', title: 'Dashboard', template: 'SupportDashboard', order: 0, layout: 'AppShell', description: 'Open and overdue tickets, average response, tickets by priority and by assignee.' },
    { name: 'support.queue', title: 'Queue', template: 'TicketQueue', order: 1, layout: 'AppShell', description: 'Every ticket, with the saved views Unassigned, Mine and Overdue.' },
    { name: 'support.queue.board', title: 'Queue board', template: 'TicketBoard', parent: 'support.queue', order: 0, layout: 'AppShell', description: 'The same tickets as cards in a column for each status.' },
    { name: 'support.queue.ticket', title: 'Ticket', template: 'TicketPage', parent: 'support.queue', layout: 'AppShell', description: 'One ticket: the conversation, its properties and the quick actions.' },
    { name: 'support.queue.new', title: 'New ticket', template: 'TicketCreateForm', parent: 'support.queue', layout: 'AppShell', description: 'Opens a ticket on behalf of a customer.' },
    { name: 'support.queue.portal', title: 'Contact support', template: 'TicketPortalForm', parent: 'support.queue', layout: 'FullPage', description: 'The public form a customer opens a ticket with, outside the application shell.' },
    { name: 'support.mine', title: 'My tickets', template: 'MyTickets', order: 2, layout: 'AppShell', description: 'The tickets assigned to me.' },
    { name: 'support.customers', title: 'Customers', template: 'CustomerList', order: 3, layout: 'AppShell', description: 'The people and organisations that write in.' },
    { name: 'support.knowledge', title: 'Knowledge base', template: 'KnowledgeBase', order: 4, layout: 'AppShell', description: 'Articles by category on the left, the chosen article on the right.' },
];
