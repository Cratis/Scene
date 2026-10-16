// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, slotLeaf } from '@cratis/scene.blueprint.default';
import { HrQuery, fromQuery, localeOfData } from '../hrQueries';
import { actionButton, component, hrMetadata, opensDialog, withBehaviors } from '../hrParts';

/**
 * The team calendar: who is away and when, on a month, a week or as an agenda (the foundation's `calendarGrid`). A request spans the days it asks for, the kind of
 * leave is told in words as well as by color, and the day and view are kept in the address, so a link shares the calendar as it is. A filter narrows it to a person
 * or a kind of leave, and the list beside it names everyone away in the period.
 */
export const hrTeamCalendarTemplate: ScreenTemplate = {
    name: 'HrTeamCalendar',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'filters' }, { name: 'calendar' }, { name: 'away' }],
    arrangement: {
        root: column([slotLeaf('header'), slotLeaf('filters'), grid([slotLeaf('calendar', { span: 2 }), slotLeaf('away')], 3, 16)], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('filters'), slotLeaf('calendar'), slotLeaf('away')], 16) }],
    },
    content: {
        header: [component('HrTeamCalendar-header', 'pageHeader', { title: 'Team calendar', subtitle: 'Who is away and when' }, {
            actions: [withBehaviors(actionButton('HrTeamCalendar-request', 'Request time off', 'primary'), opensDialog('HrRequestTimeOff'))],
        })],
        filters: [component('HrTeamCalendar-filter', 'filterBuilder', { fields: fromQuery(HrQuery.TeamCalendarFilterFields) })],
        calendar: [component('HrTeamCalendar-grid', 'calendarGrid', { label: 'Team calendar', events: fromQuery(HrQuery.TeamCalendarEvents), date: fromQuery(HrQuery.Settings, '0.calendarDay'), urlKey: 'day', ...localeOfData })],
        away: [component('HrTeamCalendar-away', 'dataList', { label: 'Away in this period', rows: fromQuery(HrQuery.TeamCalendarEvents), columns: fromQuery(HrQuery.TeamCalendarColumns), titleField: 'person', pageSize: 6, ...localeOfData })],
    },
    displayName: 'HR team calendar',
    description: 'Who is away and when, on a month, a week or as an agenda, with the kind of leave told in words.',
    metadata: hrMetadata('HrTeamCalendar', 'Calendar', [TemplateScope.Module, TemplateScope.Feature]),
};
