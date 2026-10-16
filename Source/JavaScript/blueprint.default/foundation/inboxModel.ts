// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { StatusTone, readStatusTone } from './StatusChip';

/** Which messages the inbox shows. */
export enum InboxFilter {
    All = 'all',
    Unread = 'unread',
}

/** One message in the inbox: something that wants attention - a request to decide, a notification, a mention. */
export interface InboxMessage {
    id: string;
    title: string;
    summary: string;
    sender: string;

    /** When it arrived, an ISO 8601 date or date-time. */
    received: string;

    /** What kind of message, in words. */
    category: string;
    tone: StatusTone;
    unread: boolean;
}

/** The group of messages a day belongs to, relative to today. */
export enum InboxGroup {
    Today = 'today',
    Yesterday = 'yesterday',
    Earlier = 'earlier',
}

const records = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];

/** Reads messages, dropping those without an id or a title and repeated ids; the newest comes first. */
export function readInboxMessages(value: unknown): InboxMessage[] {
    const seen = new Set<string>();
    return records(value).flatMap((entry): InboxMessage[] => {
        if (typeof entry.id !== 'string' || entry.id.length === 0 || seen.has(entry.id) || typeof entry.title !== 'string' || entry.title.length === 0) return [];
        seen.add(entry.id);
        return [{
            id: entry.id,
            title: entry.title,
            summary: typeof entry.summary === 'string' ? entry.summary : '',
            sender: typeof entry.sender === 'string' ? entry.sender : '',
            received: typeof entry.received === 'string' ? entry.received : '',
            category: typeof entry.category === 'string' ? entry.category : '',
            tone: readStatusTone(entry.tone),
            unread: entry.unread === true,
        }];
    }).sort((a, b) => b.received.localeCompare(a.received));
}

/** Reads a filter, defaulting to all. */
export const readInboxFilter = (value: unknown): InboxFilter => ((Object.values(InboxFilter) as string[]).includes(value as string) ? (value as InboxFilter) : InboxFilter.All);

/** The ids of the messages the reader has changed from how the data had them: `unread` for those now unread, `read` for those now read. */
export type ReadOverrides = Record<string, 'read' | 'unread'>;

/** Whether a message is unread, with the reader's own changes laid over what the data says. */
export const isUnread = (message: InboxMessage, overrides: ReadOverrides): boolean => (overrides[message.id] === undefined ? message.unread : overrides[message.id] === 'unread');

/** The number of unread messages. */
export const unreadCount = (messages: InboxMessage[], overrides: ReadOverrides): number => messages.filter(message => isUnread(message, overrides)).length;

/** The messages a filter and a category show; an empty category is every category. */
export function filterMessages(messages: InboxMessage[], filter: InboxFilter, category: string, overrides: ReadOverrides): InboxMessage[] {
    return messages.filter(message => (filter === InboxFilter.All || isUnread(message, overrides)) && (category === '' || message.category === category));
}

/** The categories present, in the order they first appear. */
export const categoriesOf = (messages: InboxMessage[]): string[] => [...new Set(messages.map(message => message.category).filter(category => category.length > 0))];

/** Which group a message belongs to, by calendar day: a message with no readable date is earlier. */
export function groupOf(message: InboxMessage, today: string): InboxGroup {
    const day = message.received.slice(0, 10);
    if (day === today) return InboxGroup.Today;
    const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
    return day === yesterday ? InboxGroup.Yesterday : InboxGroup.Earlier;
}

/** The messages in the groups they belong to, in order, leaving out a group with none. */
export function groupMessages(messages: InboxMessage[], today: string): { group: InboxGroup; messages: InboxMessage[] }[] {
    return [InboxGroup.Today, InboxGroup.Yesterday, InboxGroup.Earlier]
        .map(group => ({ group, messages: messages.filter(message => groupOf(message, today) === group) }))
        .filter(entry => entry.messages.length > 0);
}

/** The message a navigation key moves to from the current one: the next or previous in the list, the first or last for Home and End; undefined when the key moves nothing. */
export function moveMessage(messages: InboxMessage[], currentId: string | undefined, key: string): string | undefined {
    if (messages.length === 0) return undefined;
    const index = messages.findIndex(message => message.id === currentId);
    switch (key) {
        case 'ArrowDown': case 'j': return messages[Math.min(messages.length - 1, index + 1)].id;
        case 'ArrowUp': case 'k': return messages[Math.max(0, index < 0 ? 0 : index - 1)].id;
        case 'Home': return messages[0].id;
        case 'End': return messages[messages.length - 1].id;
        default: return undefined;
    }
}
