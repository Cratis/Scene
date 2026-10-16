// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The calendar screen (spec Part B 2.12): events on a month, a week or as an agenda, with a filter and an aside that lists what the period holds.
 * The shown day and the view live in the address, so a link shares the calendar as it is; on a phone the month becomes the agenda.
 */
export const calendarScreenTemplate: ScreenTemplate = {
    name: 'CalendarScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'toolbar' }, { name: 'filters' }, { name: 'calendar' }, { name: 'aside' }],
    arrangement: {
        root: column([slotLeaf('header'), row([slotLeaf('toolbar')], 8), slotLeaf('filters'), grid([slotLeaf('calendar', { span: 2 }), slotLeaf('aside')], 3, 16)], 12),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('toolbar'), slotLeaf('filters'), slotLeaf('calendar'), slotLeaf('aside')], 16) }],
    },
    content: {
        header: [component('calendar-header', 'pageHeader', { title: 'Calendar', subtitle: 'Who is away and when' })],
        toolbar: [component('calendar-search', 'globalSearch', { placeholder: 'Search events', label: 'Search events', urlKey: 'eventsq' })],
        filters: [component('calendar-filter', 'filterBuilder', { fields: fromQuery('CalendarFilterFields') })],
        calendar: [component('calendar-grid', 'calendarGrid', { label: 'Calendar', events: fromQuery('CalendarEvents'), urlKey: 'day' })],
        aside: [component('calendar-upcoming', 'dataList', { label: 'In this calendar', rows: fromQuery('CalendarEvents'), columns: fromQuery('CalendarEventColumns'), titleField: 'title', pageSize: 6 })],
    },
    displayName: 'Calendar',
    description: 'Events on a month, a week or an agenda, with filters and a list of what the period holds.',
    metadata: { ...foundationTemplateProvenance, type: 'Calendar', category: 'Foundation / Calendar', thumbnail: thumbnailOf('CalendarScreen') },
};
