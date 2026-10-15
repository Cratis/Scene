// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { ActivityKind, groupByDay, readActivity } from './activityModel';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon, FoundationIconName } from './FoundationIcon';
import { formatDate, formatDay, readLocale } from './formatting';
import { readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';

const icons: Record<ActivityKind, FoundationIconName> = {
    [ActivityKind.Comment]: 'user', [ActivityKind.Change]: 'refresh', [ActivityKind.Status]: 'check', [ActivityKind.System]: 'info',
};

/**
 * The `activityFeed` component: what happened to a record, newest first, under a heading for each day.
 *
 * `entries` carry an id, who (`actor`), what (`action`), the instant (`at`, ISO 8601), a `kind` and an optional `body` such as a comment's
 * text. The feed is an ordered list; each entry names its kind in words for assistive technology as well as by icon, and its time is a
 * `time` element formatted for the locale. Content is supplied by the application - this only lays it out - and a feed of any length
 * stays one list. `order="ascending"` reads oldest first, and `timeZone` fixes the zone days are cut in.
 */
export function ActivityFeed({ element, interactions }: RegisteredComponentProps) {
    const entries = useMemo(() => readActivity(element.properties.entries), [element.properties.entries]);
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const timeZone = readOptionalString(element, 'timeZone');
    const days = useMemo(() => groupByDay(entries, element.properties.order === 'ascending', timeZone), [entries, element.properties.order, timeZone]);
    const state = readComponentState(element, entries.length > 0);
    const kindText: Record<ActivityKind, string> = { comment: strings.activityComment, change: strings.activityChange, status: strings.activityStatus, system: strings.activitySystem };
    const emptyElement = state === ComponentState.Empty ? { ...element, properties: { emptyHeadline: strings.activityEmpty, ...element.properties } } : element;

    return (
        <FoundationFrame element={emptyElement} interactions={interactions} name='activity-feed' state={state} skeleton={[60, 90, 70, 85]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && days.map(day => (
                <section key={day.day} className='foundation-activity-day'>
                    <h3 className='foundation-activity-heading'><time dateTime={day.day}>{formatDay(day.day, locale)}</time></h3>
                    <ol className='foundation-activity-list'>
                        {day.entries.map(entry => (
                            <li key={entry.id} className='foundation-activity-entry' data-kind={entry.kind}>
                                <span className='foundation-activity-icon'><FoundationIcon name={icons[entry.kind]} /></span>
                                <div className='foundation-activity-content'>
                                    <p className='foundation-activity-summary'>
                                        <span className='foundation-visually-hidden'>{`${kindText[entry.kind]}: `}</span>
                                        <strong>{entry.actor}</strong> {entry.action}
                                    </p>
                                    {entry.body && <p className='foundation-activity-body'>{entry.body}</p>}
                                    <time className='foundation-count' dateTime={entry.at}>{formatDate(entry.at, locale, true)}</time>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            ))}
        </FoundationFrame>
    );
}

