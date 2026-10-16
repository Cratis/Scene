// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { readDay, readFirstDay, toDay } from './calendarModel';
import { ComponentState, readComponentState } from './ComponentState';
import { formatDay, readLocale } from './formatting';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';
import { statusToneIcons } from './StatusChip';
import { TimelineItem, TimelineScale, isConflicting, lanesOf, offsetOf, placeOf, predecessorsOf, readTimelineItems, readTimelineScale, spanOf, successorsOf, ticksOf } from './timelineModel';
import { useCompactWidth } from './useCompactWidth';
import { useUrlState } from './urlState';

const tickLabel = (day: string, scale: TimelineScale, locale: string): string => {
    try {
        const options: Intl.DateTimeFormatOptions = scale === TimelineScale.Month ? { month: 'short', year: '2-digit' } : { day: 'numeric', month: 'short' };
        return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
    } catch {
        return day;
    }
};

/**
 * The `timelineGrid` component: a Gantt-style schedule of work over time.
 *
 * `items` (`id`, `title`, `start`, `end`, `lane`, `progress`, `tone`, `dependsOn`, `milestone`) are bars in a lane for each person or team, on an axis of days,
 * weeks or months (`scale`, kept in the address under `urlKey`). A bar is a button; pressing it selects the item, and the selection panel states in words
 * everything the picture says - the dates, how far along it is, what it waits on and what waits on it - so a dependency is never only a line. An item that
 * starts before something it waits on has finished is marked as a conflict, in words. Today is marked on the axis, and the same schedule is available as a
 * table, which is how a screen reader and a phone read it. The id of the selected item is the `value` output.
 */
export function TimelineGrid({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const items = useMemo(() => readTimelineItems(element.properties.items), [element.properties.items]);
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const firstDay = readFirstDay(element.properties.firstDay);
    const today = readDay(element.properties.today) ?? toDay(new Date());
    const urlKey = readOptionalString(element, 'urlKey');
    const [requestedScale, setRequestedScale] = useUrlState(urlKey, readOptionalString(element, 'scale'));
    const [selectedId, setSelected] = useState<string | undefined>();
    const compact = useCompactWidth();
    const state = readComponentState(element, items.length > 0);
    const scale = readTimelineScale(requestedScale);
    const span = spanOf(items, scale, firstDay);
    const lanes = lanesOf(items);
    const selected = items.find(item => item.id === selectedId);

    useValueOutput(bindingOutputs, selected?.id ?? null);

    const select = (item: TimelineItem) => { setSelected(item.id); interactions?.onSelect?.(); };
    const dates = (item: TimelineItem) => (item.start === item.end ? formatDay(item.start, locale) : `${formatDay(item.start, locale)} – ${formatDay(item.end, locale)}`);
    const nameOf = (item: TimelineItem) => [item.title, item.lane, dates(item), formatText(strings.timelineProgress, { value: item.progress }), isConflicting(items, item) ? strings.timelineConflict : ''].filter(Boolean).join(', ');
    const scales: [TimelineScale, string][] = [[TimelineScale.Day, strings.timelineDay], [TimelineScale.Week, strings.timelineWeek], [TimelineScale.Month, strings.timelineMonth]];
    const todayOffset = span ? offsetOf(today, span) : undefined;

    const schedule = (
        <div className='foundation-timeline-scroll' role='region' aria-label={strings.timelineSchedule} tabIndex={0}>
            <table className='foundation-timeline-table'>
                <caption>{strings.timelineSchedule}</caption>
                <thead>
                    <tr>
                        <th scope='col'>{strings.timelineItem}</th><th scope='col'>{strings.timelineLane}</th><th scope='col'>{strings.timelineStart}</th>
                        <th scope='col'>{strings.timelineEnd}</th><th scope='col'>{strings.timelineProgressColumn}</th><th scope='col'>{strings.timelineWaitsOn}</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <th scope='row'><button type='button' className='foundation-calendar-more' aria-pressed={selectedId === item.id} onClick={() => select(item)}>{item.title}</button></th><td>{item.lane}</td><td>{formatDay(item.start, locale)}</td><td>{formatDay(item.end, locale)}</td>
                            <td>{item.progress}%</td><td>{predecessorsOf(items, item).map(predecessor => predecessor.title).join(', ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <FoundationFrame element={element} interactions={interactions} name='timeline' state={state} skeleton={[100, 100, 100, 60]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && span && (
                <div>
                    {!compact && (
                        <>
                        <div className='foundation-timeline-toolbar'>
                            <div role='group' aria-label={strings.timelineScale} className='foundation-calendar-buttons'>
                                {scales.map(([value, label]) => (
                                    <button key={value} type='button' className='foundation-button' data-emphasis={scale === value ? 'primary' : 'secondary'} aria-pressed={scale === value}
                                        onClick={() => setRequestedScale(value)}>{label}</button>
                                ))}
                            </div>
                        </div>
                        <div className='foundation-timeline-scroll' role='region' aria-label={strings.timelineChart} tabIndex={0}>
                            <div className='foundation-timeline-chart' data-scale={scale}>
                                <div className='foundation-timeline-row foundation-timeline-axis'>
                                    <span className='foundation-timeline-lane' />
                                    <div className='foundation-timeline-track' aria-hidden='true'>
                                        {ticksOf(span, scale, firstDay).map(tick => <span key={tick.day} className='foundation-timeline-tick' style={{ insetInlineStart: `${tick.offset}%` }}>{tickLabel(tick.day, scale, locale)}</span>)}
                                    </div>
                                </div>
                                {lanes.map(({ lane, items: laneItems }) => (
                                    <div key={lane} className='foundation-timeline-row' role='group' aria-label={lane || strings.timelineUnassigned}>
                                        <span className='foundation-timeline-lane'>{lane || strings.timelineUnassigned}</span>
                                        <div className='foundation-timeline-track'>
                                            {todayOffset !== undefined && <span className='foundation-timeline-today' style={{ insetInlineStart: `${todayOffset}%` }} aria-hidden='true' />}
                                            {laneItems.map(item => {
                                                const place = placeOf(item, span);
                                                return (
                                                    <button key={item.id} type='button' className='foundation-timeline-bar' data-tone={item.tone} data-milestone={item.milestone} data-conflict={isConflicting(items, item)}
                                                        aria-pressed={selectedId === item.id} aria-label={nameOf(item)} onClick={() => select(item)}
                                                        style={{ insetInlineStart: `${place.offset}%`, inlineSize: item.milestone ? undefined : `${place.width}%` }}>
                                                        {!item.milestone && <span className='foundation-timeline-progress' style={{ inlineSize: `${item.progress}%` }} aria-hidden='true' />}
                                                        <FoundationIcon name={item.milestone ? 'star' : statusToneIcons[item.tone]} />
                                                        <span className='foundation-timeline-title'>{item.title}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        </>
                    )}
                    <section className='foundation-timeline-panel' aria-label={strings.timelineSelection} aria-live='polite'>
                        {selected ? (
                            <>
                                <h4>{selected.title}</h4>
                                <p>{[selected.lane, dates(selected), formatText(strings.timelineProgress, { value: selected.progress })].filter(Boolean).join(' · ')}</p>
                                {isConflicting(items, selected) && <p className='foundation-chip' data-tone='danger'><FoundationIcon name='alert' />{strings.timelineConflict}</p>}
                                <p>{strings.timelineWaitsOn}: {predecessorsOf(items, selected).map(item => item.title).join(', ') || strings.timelineNothing}</p>
                                <p>{strings.timelineBlocks}: {successorsOf(items, selected).map(item => item.title).join(', ') || strings.timelineNothing}</p>
                            </>
                        ) : <p className='foundation-count'>{strings.timelineSelectHint}</p>}
                    </section>
                    {compact ? schedule : <details className='foundation-timeline-details'><summary>{strings.timelineShowTable}</summary>{schedule}</details>}
                </div>
            )}
        </FoundationFrame>
    );
}
