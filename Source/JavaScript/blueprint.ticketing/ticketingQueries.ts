// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind } from '@cratis/scene.model';

/**
 * A property taken from a query result - never a value. A template declares *where* its data comes from and the sample-data pack, or the real
 * query, supplies the rows (spec SD1); `path` reaches into the result (`0.value` is the first row's `value`, an empty path is the whole result).
 */
export const fromQuery = (query: string, path = ''): BindingExpression => ({ kind: BindingSourceKind.QueryResult, query, path });

/** The queries of the help desk, each a shape the sample-data packs supply rows for. */
export const TicketingQuery = {
    /** One row: the `locale` the figures and dates are formatted in. */
    Settings: 'SupportSettings',
    Kpis: 'SupportKpis',
    ByPriority: 'TicketsByPriority',
    ByAssignee: 'TicketsByAssignee',
    OverdueTickets: 'OverdueTickets',
    Tickets: 'Tickets',
    MyTickets: 'MyTickets',
    TicketColumns: 'TicketColumns',
    MyTicketColumns: 'MyTicketColumns',
    TicketFilterFields: 'TicketFilterFields',
    TicketViews: 'TicketViews',
    TicketColumnChoices: 'TicketColumnChoices',
    TicketSelection: 'TicketSelection',
    Customers: 'Customers',
    CustomerColumns: 'CustomerColumns',
    CustomerFilterFields: 'CustomerFilterFields',
    CustomerViews: 'CustomerViews',
    CustomerColumnChoices: 'CustomerColumnChoices',
    CustomerSelection: 'CustomerSelection',
    BoardStatuses: 'TicketStatuses',
    BoardTickets: 'BoardTickets',
    Ticket: 'TicketRecord',
    TicketSummary: 'TicketSummary',
    TicketProperties: 'TicketProperties',
    Conversation: 'TicketConversation',
    NextSteps: 'TicketNextSteps',
    TicketTabs: 'TicketTabs',
    QuickSections: 'TicketQuickSections',
    PortalSections: 'TicketPortalSections',
    TicketSections: 'TicketSections',
    TicketDescription: 'TicketDescription',
    CustomerQuickSections: 'CustomerQuickSections',
    AssignSections: 'AssignTicketSections',
    StatusSections: 'ChangeStatusSections',
    EscalateSections: 'EscalateTicketSections',
    MergeSections: 'MergeTicketSections',
    FormErrors: 'SupportFormErrors',
    ArticleTree: 'ArticleTree',
    ArticleTabs: 'ArticleTabs',
    ArticleSections: 'ArticleSections',
    Article: 'ArticleRecord',
} as const;

/** The locale and currency of the data, bound onto every component that formats a figure or a date. */
export const localeOfData = { locale: fromQuery(TicketingQuery.Settings, '0.locale') };
