// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What kind of thing happened, which decides the icon and the word that tells it apart without color. */
export enum ActivityKind {
    Comment = 'comment',
    Change = 'change',
    Status = 'status',
    System = 'system',
}

/** One thing that happened to a record. */
export interface ActivityEntry {
    id: string;
    actor: string;
    action: string;
    kind: ActivityKind;
    at: string;
    body?: string;
}

/** The entries of one day, in the order the feed shows them. */
export interface ActivityDay {
    day: string;
    entries: ActivityEntry[];
}

/** Reads entries out of a property value, dropping those without an id or a time that parses. */
export function readActivity(value: unknown): ActivityEntry[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): ActivityEntry[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { id, actor, action, kind, at, body } = entry as Record<string, unknown>;
        if (typeof id !== 'string' || typeof at !== 'string' || Number.isNaN(new Date(at).getTime())) return [];

        return [{
            id, at,
            actor: typeof actor === 'string' ? actor : '',
            action: typeof action === 'string' ? action : '',
            kind: (Object.values(ActivityKind) as string[]).includes(kind as string) ? (kind as ActivityKind) : ActivityKind.System,
            ...(typeof body === 'string' && body.length > 0 ? { body } : {}),
        }];
    });
}

/** The calendar day of an instant in a time zone, as `YYYY-MM-DD`. */
export function dayOf(at: string, timeZone?: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(at));
}

/** Sorts the entries by time (newest first unless `ascending`) and groups them by calendar day, so a long feed has headings to scan by. */
export function groupByDay(entries: ActivityEntry[], ascending = false, timeZone?: string): ActivityDay[] {
    const sorted = [...entries].sort((first, second) => (new Date(first.at).getTime() - new Date(second.at).getTime()) * (ascending ? 1 : -1));
    const days: ActivityDay[] = [];

    for (const entry of sorted) {
        const day = dayOf(entry.at, timeZone);
        const last = days[days.length - 1];
        if (last?.day === day) last.entries.push(entry);
        else days.push({ day, entries: [entry] });
    }

    return days;
}
