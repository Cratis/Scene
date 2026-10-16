// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { CalendarEvent, CalendarView, daysWithEvents, eventsOn, moveFocus, monthGrid, rangeOf, readCalendarEvents, readCalendarView, readDay, readFirstDay, sameMonth, step, toDay, weekOf } from './calendarModel';
import { ComponentState, readComponentState } from './ComponentState';
import { formatDay, readLocale } from './formatting';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';
import { statusToneIcons } from './StatusChip';
import { useCompactWidth } from './useCompactWidth';
import { useUrlState } from './urlState';

/** The most events a day cell of the month draws before it says how many more there are. */
const cellLimit = 2;

const format = (locale: string, options: Intl.DateTimeFormatOptions, day: string): string => {
    try {
        return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
    } catch {
        return day;
    }
};

/**
 * The `calendarGrid` component: events on a month, a week or as an agenda.
 *
 * `events` (`id`, `title`, `start`, `end`, `category`, `tone`, `person`) come from a query; an event covers every day from `start` to `end`. The month and
 * the week are a table of days: each day is a button that selects it, the arrow keys move between days (Page Up / Page Down between months) and
 * the day's events are listed below the table in full, so a busy day is never cut off. The agenda lists the month day by day and is what a
 * phone shows in place of the month. What an event is - its category and who it is for - is said in words, never only by a color.
 * The focused day and the view are kept in the address under `urlKey` (and `urlKey` + `View`) so a link and a refresh restore the screen.
 * The id of the selected event is the `value` output, for a detail to bind to.
 */
export function CalendarGrid({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const events = useMemo(() => readCalendarEvents(element.properties.events), [element.properties.events]);
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const firstDay = readFirstDay(element.properties.firstDay);
    const today = readDay(element.properties.today) ?? toDay(new Date());
    const urlKey = readOptionalString(element, 'urlKey');
    const [requestedDay, setRequestedDay] = useUrlState(urlKey, readDay(element.properties.date) ?? events[0]?.start ?? today);
    const [requestedView, setRequestedView] = useUrlState(urlKey === undefined ? undefined : `${urlKey}View`, readOptionalString(element, 'view'));
    const [selected, setSelected] = useState<string | undefined>();
    const compact = useCompactWidth();
    const root = useRef<HTMLDivElement>(null);
    const moved = useRef(false);
    const state = readComponentState(element, events.length > 0);
    const day = readDay(requestedDay) ?? today;
    const chosen = readCalendarView(requestedView);
    const view = compact && chosen === CalendarView.Month ? CalendarView.Agenda : chosen;
    const range = rangeOf(day, view, firstDay);

    useValueOutput(bindingOutputs, selected ?? null);
    useEffect(() => {
        if (!moved.current) return;
        moved.current = false;
        root.current?.querySelector<HTMLElement>(`[data-day="${day}"]`)?.focus();
    }, [day]);

    const goTo = (target: string, focus = false) => { moved.current = focus; setRequestedDay(target); };
    const heading = view === CalendarView.Week
        ? `${format(locale, { day: 'numeric', month: 'short' }, range.from)} – ${format(locale, { day: 'numeric', month: 'short', year: 'numeric' }, range.to)}`
        : format(locale, { month: 'long', year: 'numeric' }, day);
    const select = (event: CalendarEvent) => { setSelected(event.id); interactions?.onSelect?.(); };
    const onKeyDown = (event: KeyboardEvent, current: string) => {
        const target = moveFocus(current, event.key);
        if (target === undefined) return;
        event.preventDefault();
        goTo(target, true);
    };

    const views: [CalendarView, string][] = [[CalendarView.Month, strings.calendarMonth], [CalendarView.Week, strings.calendarWeek], [CalendarView.Agenda, strings.calendarAgenda]];
    const eventButton = (event: CalendarEvent, full: boolean) => (
        <button type='button' className='foundation-calendar-event' data-tone={event.tone} aria-pressed={selected === event.id}
            aria-label={[event.title, event.category, event.person].filter(Boolean).join(', ')} onClick={() => select(event)}>
            <FoundationIcon name={statusToneIcons[event.tone]} />
            <span>{event.title}</span>
            {full && event.person && <span className='foundation-count'>{event.person}</span>}
        </button>
    );
    const eventLine = (event: CalendarEvent) => (
        <li key={event.id} className='foundation-calendar-line'>
            {eventButton(event, true)}
            {event.category && <span className='foundation-chip' data-tone={event.tone}>{event.category}</span>}
            <span className='foundation-count'>{event.start === event.end ? formatDay(event.start, locale) : `${formatDay(event.start, locale)} – ${formatDay(event.end, locale)}`}</span>
        </li>
    );
    const dayEvents = eventsOn(events, day);
    const weeks = view === CalendarView.Week ? [weekOf(day, firstDay)] : view === CalendarView.Month ? monthGrid(day, firstDay) : [];
    const weekdays = weekOf(day, firstDay);
    const agendaDays = daysWithEvents(events, range.from, range.to);

    return (
        <FoundationFrame element={element} interactions={interactions} name='calendar' state={state} skeleton={[40, 100, 100, 100]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <div ref={root}>
                    <div className='foundation-calendar-toolbar'>
                        <div role='group' aria-label={strings.calendarNavigate} className='foundation-calendar-buttons'>
                            <button type='button' className='foundation-button' data-emphasis='secondary' onClick={() => goTo(step(day, view, -1))}>{strings.calendarPrevious}</button>
                            <button type='button' className='foundation-button' data-emphasis='secondary' onClick={() => goTo(today)}>{strings.calendarToday}</button>
                            <button type='button' className='foundation-button' data-emphasis='secondary' onClick={() => goTo(step(day, view, 1))}>{strings.calendarNext}</button>
                        </div>
                        <h3 className='foundation-calendar-heading' aria-live='polite'>{heading}</h3>
                        <div role='group' aria-label={strings.calendarView} className='foundation-calendar-buttons'>
                            {views.map(([value, label]) => (
                                <button key={value} type='button' className='foundation-button' data-emphasis={view === value ? 'primary' : 'secondary'} aria-pressed={view === value}
                                    onClick={() => setRequestedView(value)}>{label}</button>
                            ))}
                        </div>
                    </div>
                    {view !== CalendarView.Agenda && (
                        <div className='foundation-calendar-scroll'>
                            <table className='foundation-calendar-grid' data-view={view}>
                                <caption className='foundation-visually-hidden'>{heading}</caption>
                                <thead>
                                    <tr>{weekdays.map(weekday => <th key={weekday} scope='col' abbr={format(locale, { weekday: 'long' }, weekday)}>{format(locale, { weekday: 'short' }, weekday)}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {weeks.map(week => (
                                        <tr key={week[0]}>
                                            {week.map(cell => {
                                                const inCell = eventsOn(events, cell);
                                                const shown = view === CalendarView.Week ? inCell : inCell.slice(0, cellLimit);
                                                return (
                                                    <td key={cell} data-today={cell === today} data-selected={cell === day} data-outside={view === CalendarView.Month && !sameMonth(cell, day)}>
                                                        <button type='button' className='foundation-calendar-day' data-day={cell} tabIndex={cell === day ? 0 : -1} aria-current={cell === today ? 'date' : undefined}
                                                            aria-pressed={cell === day} aria-label={formatText(strings.calendarDay, { date: formatDay(cell, locale), count: inCell.length })}
                                                            onClick={() => goTo(cell)} onKeyDown={event => onKeyDown(event, cell)}>
                                                            {Number(cell.slice(8))}
                                                        </button>
                                                        <ul className='foundation-calendar-cell'>
                                                            {shown.map(event => <li key={event.id}>{eventButton(event, false)}</li>)}
                                                            {inCell.length > shown.length && <li><button type='button' className='foundation-calendar-more' onClick={() => goTo(cell)}>{formatText(strings.calendarMore, { count: inCell.length - shown.length })}</button></li>}
                                                        </ul>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {view === CalendarView.Agenda ? (
                        <div className='foundation-calendar-agenda'>
                            {agendaDays.length === 0 && <p className='foundation-count'>{strings.calendarNoEvents}</p>}
                            {agendaDays.map(agendaDay => (
                                <section key={agendaDay} aria-label={formatDay(agendaDay, locale)}>
                                    <h4>{formatDay(agendaDay, locale)}</h4>
                                    <ul className='foundation-calendar-lines'>{eventsOn(events, agendaDay).map(eventLine)}</ul>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <section className='foundation-calendar-day-panel' aria-label={formatText(strings.calendarEventsOn, { date: formatDay(day, locale) })}>
                            <h4>{formatDay(day, locale)}</h4>
                            {dayEvents.length === 0 ? <p className='foundation-count'>{strings.calendarNoEvents}</p> : <ul className='foundation-calendar-lines'>{dayEvents.map(eventLine)}</ul>}
                        </section>
                    )}
                </div>
            )}
        </FoundationFrame>
    );
}
