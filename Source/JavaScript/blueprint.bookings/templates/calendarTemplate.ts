// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, slotLeaf } from '@cratis/scene.blueprint.default';
import { BookingsQuery, fromQuery, localeOfData } from '../bookingsQueries';
import { actionButton, component, goesTo, bookingsMetadata, opensDialog, withBehaviors } from '../bookingsParts';

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
            calendar: [component(`${id}-grid`, 'calendarGrid', { label: options.label, events: fromQuery(options.events), date: fromQuery(BookingsQuery.Settings, '0.today'), urlKey: 'day', ...localeOfData })],
            due: [component(`${id}-list`, 'dataList', { label: options.listLabel, rows: fromQuery(options.events), columns: fromQuery(options.columns), titleField: options.titleField, pageSize: 6, ...localeOfData })],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: bookingsMetadata(options.name, 'Calendar', [TemplateScope.Module, TemplateScope.Feature]),
    };
}

/** The bookings calendar: each booking on its day on a month, a week or an agenda; the status is told in words as well as by color, and the list beside it names every booking in the period. */
export const bookingsCalendarTemplate = calendarOf({
    name: 'BookingsCalendar', displayName: 'Bookings calendar', description: 'Every booking on the day it falls, on a month, a week or as an agenda, with the status told in words.', title: 'Calendar', subtitle: 'Who has what, and when', label: 'Bookings', listLabel: 'Bookings in this period',
    events: BookingsQuery.BookingEvents, columns: BookingsQuery.BookingEventColumns, titleField: 'title',
    actions: [{ id: 'book', label: 'Book a resource', emphasis: 'primary', screen: 'bookings.new' }],
});
