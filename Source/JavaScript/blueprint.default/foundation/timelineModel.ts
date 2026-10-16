// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { addDays, addMonths, daysBetween, readDay, startOfWeek } from './calendarModel';
import { StatusTone, readStatusTone } from './StatusChip';

/** How coarse the scale of the time axis is: a tick for each day, week or month. */
export enum TimelineScale {
    Day = 'day',
    Week = 'week',
    Month = 'month',
}

/** One bar on the timeline: a piece of work between two days, in the lane of whoever or whatever it belongs to, optionally waiting on other pieces of work. */
export interface TimelineItem {
    id: string;
    title: string;

    /** The first day, `YYYY-MM-DD`. */
    start: string;

    /** The last day, inclusive; never before `start`. */
    end: string;

    /** The lane the bar is drawn in (a person, a team, a project); empty items share one unnamed lane. */
    lane: string;

    /** How much of it is done, 0 to 100. */
    progress: number;
    tone: StatusTone;

    /** The ids of the items that must finish before this one starts. */
    dependsOn: string[];

    /** A milestone is a single day drawn as a diamond rather than a bar. */
    milestone: boolean;
}

/** A tick on the time axis. */
export interface TimelineTick {
    day: string;

    /** Where it falls along the axis, as a percentage. */
    offset: number;
}

const records = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];

/** Reads a scale, defaulting to the week. */
export function readTimelineScale(value: unknown): TimelineScale {
    return (Object.values(TimelineScale) as string[]).includes(value as string) ? (value as TimelineScale) : TimelineScale.Week;
}

/** Reads items, dropping those without an id, a title or a start and repeated ids; an end before the start is taken as the start, and a dependency on an unknown item or on itself is dropped. */
export function readTimelineItems(value: unknown): TimelineItem[] {
    const seen = new Set<string>();
    const read = records(value).flatMap((entry): TimelineItem[] => {
        const start = readDay(entry.start);
        if (typeof entry.id !== 'string' || entry.id.length === 0 || seen.has(entry.id) || typeof entry.title !== 'string' || entry.title.length === 0 || start === undefined) return [];
        seen.add(entry.id);
        const end = readDay(entry.end);
        const last = end !== undefined && end >= start ? end : start;
        return [{
            id: entry.id,
            title: entry.title,
            start,
            end: last,
            lane: typeof entry.lane === 'string' ? entry.lane : '',
            progress: typeof entry.progress === 'number' ? Math.min(100, Math.max(0, Math.round(entry.progress))) : 0,
            tone: readStatusTone(entry.tone),
            dependsOn: Array.isArray(entry.dependsOn) ? entry.dependsOn.filter((id): id is string => typeof id === 'string') : [],
            milestone: entry.milestone === true,
        }];
    });
    return read.map(item => ({ ...item, dependsOn: item.dependsOn.filter(id => id !== item.id && seen.has(id)) }));
}

/** The lanes in the order they first appear, each with its items sorted by start. */
export function lanesOf(items: TimelineItem[]): { lane: string; items: TimelineItem[] }[] {
    const order: string[] = [];
    for (const item of items) if (!order.includes(item.lane)) order.push(item.lane);
    return order.map(lane => ({ lane, items: items.filter(item => item.lane === lane).sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end)) }));
}

/** The first and last day the axis shows: the span of the items, widened to whole ticks of the scale (and to at least one tick), so a bar never touches the edge. */
export function spanOf(items: TimelineItem[], scale: TimelineScale, firstDay: number): { from: string; to: string } | undefined {
    if (items.length === 0) return undefined;
    const first = items.reduce((day, item) => (item.start < day ? item.start : day), items[0].start);
    const last = items.reduce((day, item) => (item.end > day ? item.end : day), items[0].end);
    if (scale === TimelineScale.Day) return { from: first, to: last };
    if (scale === TimelineScale.Week) return { from: startOfWeek(first, firstDay), to: addDays(startOfWeek(last, firstDay), 6) };
    return { from: `${first.slice(0, 7)}-01`, to: addDays(addMonths(`${last.slice(0, 7)}-01`, 1), -1) };
}

/** The number of days the axis covers. */
export const spanLength = (span: { from: string; to: string }): number => daysBetween(span.from, span.to) + 1;

/** The ticks of the axis, each with where it falls. */
export function ticksOf(span: { from: string; to: string }, scale: TimelineScale, firstDay: number): TimelineTick[] {
    const length = spanLength(span);
    const ticks: TimelineTick[] = [];
    let day = span.from;
    while (day <= span.to) {
        ticks.push({ day, offset: (daysBetween(span.from, day) / length) * 100 });
        day = scale === TimelineScale.Day ? addDays(day, 1) : scale === TimelineScale.Week ? addDays(startOfWeek(day, firstDay), 7) : addMonths(`${day.slice(0, 7)}-01`, 1);
    }

    return ticks;
}

/** Where a bar sits on the axis, as a percentage of its width: from the start of its first day to the end of its last. */
export function placeOf(item: TimelineItem, span: { from: string; to: string }): { offset: number; width: number } {
    const length = spanLength(span);
    return { offset: (daysBetween(span.from, item.start) / length) * 100, width: ((daysBetween(item.start, item.end) + 1) / length) * 100 };
}

/** Where a day falls on the axis as a percentage, or undefined when it is outside. */
export function offsetOf(day: string, span: { from: string; to: string }): number | undefined {
    return day < span.from || day > span.to ? undefined : ((daysBetween(span.from, day) + 0.5) / spanLength(span)) * 100;
}

/** The items an item waits on. */
export const predecessorsOf = (items: TimelineItem[], item: TimelineItem): TimelineItem[] => item.dependsOn.flatMap(id => items.filter(candidate => candidate.id === id));

/** The items that wait on an item. */
export const successorsOf = (items: TimelineItem[], item: TimelineItem): TimelineItem[] => items.filter(candidate => candidate.dependsOn.includes(item.id));

/** Whether an item starts before something it waits on has finished: the schedule contradicts itself. */
export const isConflicting = (items: TimelineItem[], item: TimelineItem): boolean => predecessorsOf(items, item).some(predecessor => predecessor.end >= item.start);
