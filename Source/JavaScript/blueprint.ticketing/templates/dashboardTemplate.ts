// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { dashboardScreenTemplate } from '@cratis/scene.blueprint.default';
import { TicketingQuery, fromQuery, localeOfData } from '../ticketingQueries';
import { component, ticketingMetadata } from '../ticketingParts';

/**
 * The support dashboard (the foundation Dashboard): three key figures - open tickets, overdue tickets and the average first response - over tickets by priority
 * and by assignee, with the overdue tickets beneath and the signed-in agent's own next steps beside them. Every region is its own component with its own
 * loading, empty and error states, so one failed query leaves the others.
 */
export const supportDashboardTemplate: ScreenTemplate = {
    name: 'SupportDashboard',
    fitsSlot: 'content',
    slots: dashboardScreenTemplate.slots,
    arrangement: dashboardScreenTemplate.arrangement,
    content: {
        header: [component('support-dashboard-header', 'pageHeader', { title: 'Support dashboard', subtitle: 'How the queue is doing right now' })],
        kpis: [
            component('support-kpi-open', 'statCard', { label: 'Open tickets', value: fromQuery(TicketingQuery.Kpis, '0.value'), change: fromQuery(TicketingQuery.Kpis, '0.change'), format: 'number', fractionDigits: 0, comparison: 'last week', ...localeOfData }),
            component('support-kpi-overdue', 'statCard', { label: 'Overdue', value: fromQuery(TicketingQuery.Kpis, '1.value'), change: fromQuery(TicketingQuery.Kpis, '1.change'), format: 'number', fractionDigits: 0, comparison: 'last week', ...localeOfData }),
            component('support-kpi-response', 'statCard', { label: 'Average first response (hours)', value: fromQuery(TicketingQuery.Kpis, '2.value'), change: fromQuery(TicketingQuery.Kpis, '2.change'), format: 'number', fractionDigits: 1, comparison: 'last week', ...localeOfData }),
        ],
        charts: [
            component('support-chart-priority', 'chartWrapper', { title: 'Open tickets by priority', kind: 'donut', categories: fromQuery(TicketingQuery.ByPriority, '0.categories'), series: fromQuery(TicketingQuery.ByPriority, '0.series'), ...localeOfData }),
            component('support-chart-assignee', 'chartWrapper', { title: 'Open tickets by assignee', kind: 'bar', categories: fromQuery(TicketingQuery.ByAssignee, '0.categories'), series: fromQuery(TicketingQuery.ByAssignee, '0.series'), ...localeOfData }),
        ],
        tables: [component('support-dashboard-overdue', 'dataList', { label: 'Overdue tickets', rows: fromQuery(TicketingQuery.OverdueTickets), columns: fromQuery(TicketingQuery.MyTicketColumns), titleField: 'subject', pageSize: 5, ...localeOfData })],
        aside: [component('support-dashboard-steps', 'checklistSection', { label: 'My next steps', sections: fromQuery(TicketingQuery.NextSteps), ...localeOfData })],
    },
    displayName: 'Support dashboard',
    description: 'Open and overdue tickets, average first response, tickets by priority and by assignee, and the overdue tickets.',
    metadata: ticketingMetadata('SupportDashboard', 'Dashboard', [TemplateScope.Module, TemplateScope.Feature]),
};
