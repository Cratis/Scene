// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, slotLeaf } from '@cratis/scene.blueprint.default';
import { InvoicingQuery, fromQuery, localeOfData } from '../invoicingQueries';
import { actionButton, component, goesTo, invoicingMetadata, opensDialog, withBehaviors } from '../invoicingParts';

interface Action { id: string; label: string; emphasis: 'primary' | 'secondary' | 'quiet' | 'danger'; dialog?: string; screen?: string }

interface CalendarOptions {
    name: string;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    label: string;
    listLabel: string;
    events: string;
    columns: string;
    titleField: string;
    actions: Action[];
}

/**
 * One calendar: the foundation's `calendarGrid` on a month, a week or as an agenda. The status is told in words as well as by color, the day and view are kept in the
 * address so a link shares the calendar as it is, and the list beside it names everything in the period.
 */
function calendarOf(options: CalendarOptions): ScreenTemplate {
    const id = options.name;
    return {
        name: options.name,
        fitsSlot: 'content',
        slots: [{ name: 'header' }, { name: 'calendar' }, { name: 'due' }],
        arrangement: {
            root: column([slotLeaf('header'), grid([slotLeaf('calendar', { span: 2 }), slotLeaf('due')], 3, 16)], 16),
            overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('calendar'), slotLeaf('due')], 16) }],
        },
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, {
                actions: options.actions.map(action => withBehaviors(actionButton(`${id}-${action.id}`, action.label, action.emphasis), action.dialog ? opensDialog(action.dialog) : goesTo(action.screen!))),
            })],
            calendar: [component(`${id}-grid`, 'calendarGrid', { label: options.label, events: fromQuery(options.events), date: fromQuery(InvoicingQuery.Settings, '0.today'), urlKey: 'day', ...localeOfData })],
            due: [component(`${id}-list`, 'dataList', { label: options.listLabel, rows: fromQuery(options.events), columns: fromQuery(options.columns), titleField: options.titleField, pageSize: 6, ...localeOfData })],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: invoicingMetadata(options.name, 'Calendar', [TemplateScope.Module, TemplateScope.Feature]),
    };
}

/** The due-date calendar: the day each invoice falls due on a month, a week or an agenda; the status is told in words as well as by color, and the list beside it names every invoice due in the period. */
export const invoicingDueDatesTemplate = calendarOf({
    name: 'InvoicingDueDates', displayName: 'Invoicing due-date calendar', description: 'The day each invoice falls due, on a month, a week or as an agenda, with the status told in words.', title: 'Due dates', subtitle: 'When each invoice falls due', label: 'Invoice due dates', listLabel: 'Due in this period',
    events: InvoicingQuery.DueDates, columns: InvoicingQuery.DueColumns, titleField: 'title',
    actions: [{ id: 'invoices', label: 'Open the invoices', emphasis: 'secondary', screen: 'invoicing.list' }],
});
