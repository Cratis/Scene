// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { StatusTone, readStatusTone } from './StatusChip';

/** How much of the calendar is drawn at once. The agenda is the list of the month's events day by day: the phone's calendar and the screen reader's. */
export enum CalendarView {
    Month = 'month',
    Week = 'week',
    Agenda = 'agenda',
}

/** One event on the calendar: a title between two days (the same day for a one-day event), with a category told in words, a tone and who it concerns. */
export interface CalendarEvent {
    id: string;
    title: string;

    /** The first day, `YYYY-MM-DD`. */
    start: string;

    /** The last day, inclusive, `YYYY-MM-DD`; never before `start`. */
    end: string;

    /** What kind of event it is, in words - the color alone never tells. */
    category: string;
    tone: StatusTone;
    person?: string;
}

const dayPattern = /^(\d{4})-(\d{2})-(\d{2})/;
const millisecondsPerDay = 86_400_000;

const records = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];

/** The day of an ISO date or date-time, as `YYYY-MM-DD`, or undefined when the text is not a real calendar day. */
export function readDay(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const match = dayPattern.exec(value);
    if (!match) return undefined;
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return toDay(date) === match[0] ? match[0] : undefined;
}

const toDate = (day: string): Date => new Date(`${day}T00:00:00Z`);

/** The `YYYY-MM-DD` of a date, in UTC - calendar days carry no time zone. */
export function toDay(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** A day some days later (or earlier, when negative). */
export function addDays(day: string, days: number): string {
    return toDay(new Date(toDate(day).getTime() + days * millisecondsPerDay));
}

/** The number of days from one day to another; negative when the second is earlier. */
export function daysBetween(from: string, to: string): number {
    return Math.round((toDate(to).getTime() - toDate(from).getTime()) / millisecondsPerDay);
}

/** A day some months later, kept in the target month (31 January + 1 month is 28 or 29 February). */
export function addMonths(day: string, months: number): string {
    const date = toDate(day);
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
    const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    return toDay(new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(date.getUTCDate(), last))));
}

/** The first day of a week that begins on `firstDay` (0 is Sunday, 1 Monday) and contains the day. */
export function startOfWeek(day: string, firstDay: number): string {
    const offset = (toDate(day).getUTCDay() - firstDay + 7) % 7;
    return addDays(day, -offset);
}

/** The seven days of the week containing the day. */
export function weekOf(day: string, firstDay: number): string[] {
    const start = startOfWeek(day, firstDay);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

/** The weeks that cover the month containing the day - whole weeks, so the grid is a rectangle, with the days of the neighbouring months that fill it. */
export function monthGrid(day: string, firstDay: number): string[][] {
    const first = `${day.slice(0, 7)}-01`;
    const last = addDays(addMonths(first, 1), -1);
    const weeks: string[][] = [];
    for (let start = startOfWeek(first, firstDay); start <= last; start = addDays(start, 7)) weeks.push(weekOf(start, firstDay));
    return weeks;
}

/** Whether two days are in the same month of the same year. */
export const sameMonth = (a: string, b: string): boolean => a.slice(0, 7) === b.slice(0, 7);

/** Reads events, dropping those without an id, a title or a start, and repeated ids; an end before the start is taken as the start. */
export function readCalendarEvents(value: unknown): CalendarEvent[] {
    const seen = new Set<string>();
    return records(value).flatMap((entry): CalendarEvent[] => {
        const start = readDay(entry.start);
        if (typeof entry.id !== 'string' || entry.id.length === 0 || seen.has(entry.id) || typeof entry.title !== 'string' || entry.title.length === 0 || start === undefined) return [];
        seen.add(entry.id);
        const end = readDay(entry.end);
        return [{
            id: entry.id,
            title: entry.title,
            start,
            end: end !== undefined && end >= start ? end : start,
            category: typeof entry.category === 'string' ? entry.category : '',
            tone: readStatusTone(entry.tone),
            person: typeof entry.person === 'string' && entry.person.length > 0 ? entry.person : undefined,
        }];
    }).sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.title.localeCompare(b.title));
}

/** The events that cover a day. */
export const eventsOn = (events: CalendarEvent[], day: string): CalendarEvent[] => events.filter(event => event.start <= day && day <= event.end);

/** The events that touch any day from `from` to `to`, both included. */
export const eventsBetween = (events: CalendarEvent[], from: string, to: string): CalendarEvent[] => events.filter(event => event.start <= to && event.end >= from);

/** The days from `from` to `to` on which at least one event falls, in order. */
export function daysWithEvents(events: CalendarEvent[], from: string, to: string): string[] {
    const days = new Set<string>();
    for (const event of eventsBetween(events, from, to)) {
        for (let current = event.start < from ? from : event.start; current <= event.end && current <= to; current = addDays(current, 1)) days.add(current);
    }

    return [...days].sort();
}

/** The number of days an event covers. */
export const lengthOf = (event: CalendarEvent): number => daysBetween(event.start, event.end) + 1;

/** The day a view moves to when stepped one view-length forward (1) or back (-1). */
export function step(day: string, view: CalendarView, direction: -1 | 1): string {
    return view === CalendarView.Week ? addDays(day, 7 * direction) : addMonths(day, direction);
}

/** The first and last day a view shows. */
export function rangeOf(day: string, view: CalendarView, firstDay: number): { from: string; to: string } {
    if (view === CalendarView.Week) {
        const week = weekOf(day, firstDay);
        return { from: week[0], to: week[6] };
    }

    if (view === CalendarView.Agenda) return { from: `${day.slice(0, 7)}-01`, to: addDays(addMonths(`${day.slice(0, 7)}-01`, 1), -1) };
    const weeks = monthGrid(day, firstDay);
    return { from: weeks[0][0], to: weeks[weeks.length - 1][6] };
}

/** Reads a view, defaulting to the month. */
export function readCalendarView(value: unknown): CalendarView {
    return (Object.values(CalendarView) as string[]).includes(value as string) ? (value as CalendarView) : CalendarView.Month;
}

/** Reads the first day of the week (0-6), defaulting to Monday. */
export const readFirstDay = (value: unknown): number => (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 6 ? value : 1);

/** The day an arrow key moves the focus to, or undefined when the key moves nothing. */
export function moveFocus(day: string, key: string): string | undefined {
    switch (key) {
        case 'ArrowLeft': return addDays(day, -1);
        case 'ArrowRight': return addDays(day, 1);
        case 'ArrowUp': return addDays(day, -7);
        case 'ArrowDown': return addDays(day, 7);
        case 'PageUp': return addMonths(day, -1);
        case 'PageDown': return addMonths(day, 1);
        default: return undefined;
    }
}
