// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { TicketingQuery, fromQuery, localeOfData } from '../ticketingQueries';
import { actionButton, component, opensDialog, ticketingMetadata, withBehaviors } from '../ticketingParts';

/**
 * The ticket page: the foundation `RecordPage` with the subject as its title and the four quick actions - assign, change status, escalate and merge - each opening
 * its dialog over the page. The conversation is the page's activity, the ticket's properties sit in the aside, and the key facts - status, priority, who
 * it is assigned to and how long it has waited - sit under the title.
 */
export const ticketPageTemplate: ScreenTemplate = {
    name: 'TicketPage',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('ticket-header', 'pageHeader', { title: fromQuery(TicketingQuery.Ticket, '0.subject'), subtitle: fromQuery(TicketingQuery.Ticket, '0.reference') }, {
            actions: [
                withBehaviors(actionButton('ticket-assign', 'Assign', 'secondary'), opensDialog('AssignTicket')),
                withBehaviors(actionButton('ticket-status', 'Change status', 'secondary'), opensDialog('ChangeTicketStatus')),
                withBehaviors(actionButton('ticket-escalate', 'Escalate', 'secondary'), opensDialog('EscalateTicket')),
                withBehaviors(actionButton('ticket-merge', 'Merge', 'secondary'), opensDialog('MergeTickets')),
            ],
        })],
        summary: [
            component('ticket-status-chip', 'statusChip', { status: fromQuery(TicketingQuery.TicketSummary, '0.status'), tone: fromQuery(TicketingQuery.TicketSummary, '0.statusTone') }),
            component('ticket-priority-chip', 'statusChip', { status: fromQuery(TicketingQuery.TicketSummary, '0.priority'), tone: fromQuery(TicketingQuery.TicketSummary, '0.priorityTone') }),
            component('ticket-waiting', 'statCard', { label: 'Waiting (hours)', value: fromQuery(TicketingQuery.TicketSummary, '0.waitingHours'), format: 'number', fractionDigits: 0, ...localeOfData }),
            component('ticket-people', 'avatarStack', { people: fromQuery(TicketingQuery.TicketSummary, '0.people') }),
        ],
        tabs: [component('ticket-tabs', 'tabSet', { tabs: fromQuery(TicketingQuery.TicketTabs), urlKey: 'tab', label: 'Ticket sections' })],
        main: [component('ticket-description', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(TicketingQuery.TicketDescription), values: fromQuery(TicketingQuery.Ticket, '0'), ...localeOfData })],
        related: [],
        activity: [component('ticket-conversation', 'activityFeed', { label: 'Conversation', entries: fromQuery(TicketingQuery.Conversation), ...localeOfData })],
        aside: [
            component('ticket-properties', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(TicketingQuery.TicketProperties), values: fromQuery(TicketingQuery.Ticket, '0'), ...localeOfData }),
            component('ticket-steps', 'checklistSection', { label: 'Next steps', sections: fromQuery(TicketingQuery.NextSteps), ...localeOfData }),
        ],
    },
    displayName: 'Ticket page',
    description: 'One ticket: the conversation, its properties in the aside, and the quick actions assign, change status, escalate and merge.',
    metadata: ticketingMetadata('TicketPage', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
