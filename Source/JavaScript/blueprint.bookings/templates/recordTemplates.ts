// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { BookingsEntityKind, currencyOfData, fromQuery, localeOfData, bookingsQueriesOf } from '../bookingsQueries';
import { actionButton, component, goesTo, bookingsMetadata, opensDialog, withBehaviors } from '../bookingsParts';

interface Fact { id: string; label: string; field: string; format?: 'currency' | 'percent' }
interface Extra { key: string; label: string; titleField: string; pageSize?: number }
interface Action { id: string; label: string; emphasis: 'primary' | 'secondary' | 'quiet' | 'danger'; dialog?: string; screen?: string }

interface RecordOptions {
    name: string;
    entity: BookingsEntityKind;
    displayName: string;
    description: string;
    titleField: string;
    backScreen: string;
    backLabel: string;
    facts: Fact[];
    extras: Extra[];
    actions: Action[];
}

/**
 * One record page: the foundation `RecordPage` with the record's own title, its status and key facts at the top, its fields and the lists that belong to it in the
 * main region, and the activity beside it. What it shows is the record the list handed it the id of.
 */
function recordPageOf(options: RecordOptions): ScreenTemplate {
    const queries = bookingsQueriesOf(options.entity);
    const id = options.name;
    return {
        name: options.name,
        fitsSlot: 'content',
        slots: recordPageTemplate.slots,
        arrangement: recordPageTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: fromQuery(queries.record, `0.${options.titleField}`), subtitle: fromQuery(queries.record, '0.summary') }, {
                actions: [
                    withBehaviors(actionButton(`${id}-back`, options.backLabel, 'secondary'), goesTo(options.backScreen)),
                    ...options.actions.map(action => withBehaviors(actionButton(`${id}-${action.id}`, action.label, action.emphasis), action.dialog ? opensDialog(action.dialog) : goesTo(action.screen!))),
                ],
            })],
            summary: [
                component(`${id}-status`, 'statusChip', { status: fromQuery(queries.summary, '0.status'), tone: fromQuery(queries.summary, '0.tone') }),
                ...options.facts.map(fact => component(`${id}-${fact.id}`, 'statCard', {
                    label: fact.label, value: fromQuery(queries.summary, `0.${fact.field}`), ...(fact.format ? { format: fact.format } : {}), ...currencyOfData,
                })),
            ],
            tabs: [component(`${id}-tabs`, 'tabSet', { tabs: fromQuery(queries.tabs), urlKey: 'tab', label: `${options.displayName} sections` })],
            main: [
                component(`${id}-form`, 'formScreenBody', { mode: 'readOnly', sections: fromQuery(queries.sections), values: fromQuery(queries.record, '0'), ...currencyOfData }),
                ...options.extras.map(extra => component(`${id}-${extra.key.toLowerCase()}`, 'dataList', {
                    label: extra.label, rows: fromQuery(`${options.entity}${extra.key}`), columns: fromQuery(`${options.entity}${extra.key}Columns`), titleField: extra.titleField, pageSize: extra.pageSize ?? 8, ...currencyOfData,
                })),
            ],
            related: [],
            activity: [component(`${id}-activity`, 'activityFeed', { label: 'Activity', entries: fromQuery(queries.activity), ...localeOfData })],
            aside: [],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: bookingsMetadata(options.name, 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
    };
}

/** The booking page: the booking reference as its title, its status, date, hours and people at the top, its details, attendees and extras in the main region, and the activity beside it. */
export const bookingPageTemplate = recordPageOf({
    name: 'BookingPage', entity: BookingsEntityKind.Booking, displayName: 'Booking page', description: 'One booking: status, date, hours and people, its details, attendees and extras, and its activity.', titleField: 'reference', backScreen: 'bookings.list', backLabel: 'Back to bookings',
    facts: [
        { id: 'date', label: 'Date', field: 'date' },
        { id: 'hours', label: 'Hours', field: 'hours' },
        { id: 'people', label: 'People', field: 'people' },
    ],
    extras: [{ key: 'Attendees', label: 'Attendees', titleField: 'name' }, { key: 'Extras', label: 'Extras', titleField: 'item' }],
    actions: [],
});
