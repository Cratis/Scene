// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One column of a board, mapped to a status or stage value. */
export interface BoardColumn {
    id: string;
    label: string;
    /** The most cards the stage should hold; 0 means no limit. */
    limit: number;
}

/** One card: the title, an assignee, a few key fields and badges. */
export interface BoardCard {
    id: string;
    title: string;
    column: string;
    assignee?: string;
    fields: { label: string; value: string }[];
    badges: string[];
}

const records = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];

/** Reads columns, dropping those without an id and repeated ids. */
export function readColumnsOfBoard(value: unknown): BoardColumn[] {
    const seen = new Set<string>();
    return records(value).flatMap(entry => {
        if (typeof entry.id !== 'string' || entry.id.length === 0 || seen.has(entry.id)) return [];
        seen.add(entry.id);
        return [{ id: entry.id, label: typeof entry.label === 'string' && entry.label.length > 0 ? entry.label : entry.id, limit: typeof entry.limit === 'number' && entry.limit > 0 ? Math.floor(entry.limit) : 0 }];
    });
}

/** Reads cards, dropping those without an id or a title, keeping at most three key fields. */
export function readCards(value: unknown): BoardCard[] {
    const seen = new Set<string>();
    return records(value).flatMap(entry => {
        if (typeof entry.id !== 'string' || entry.id.length === 0 || seen.has(entry.id) || typeof entry.title !== 'string') return [];
        seen.add(entry.id);
        const fields = records(entry.fields).flatMap(field => (typeof field.label === 'string' && typeof field.value === 'string' ? [{ label: field.label, value: field.value }] : [])).slice(0, 3);
        return [{
            id: entry.id, title: entry.title, column: typeof entry.column === 'string' ? entry.column : '', fields,
            badges: Array.isArray(entry.badges) ? entry.badges.filter((badge): badge is string => typeof badge === 'string') : [],
            ...(typeof entry.assignee === 'string' ? { assignee: entry.assignee } : {}),
        }];
    });
}

/** The cards of one column, in the order given. A card whose column does not exist is shown in the first column rather than lost. */
export function cardsOf(columns: BoardColumn[], cards: BoardCard[], column: string): BoardCard[] {
    const known = new Set(columns.map(candidate => candidate.id));
    return cards.filter(card => card.column === column || (column === columns[0]?.id && !known.has(card.column)));
}

/** Moves a card to a column, at the end; moving to the column it is in, or to one that does not exist, changes nothing. */
export function moveCard(columns: BoardColumn[], cards: BoardCard[], id: string, to: string): BoardCard[] {
    const card = cards.find(candidate => candidate.id === id);
    if (!card || !columns.some(column => column.id === to) || cardsOf(columns, cards, to).includes(card)) return cards;
    return [...cards.filter(candidate => candidate.id !== id), { ...card, column: to }];
}

/** Whether a column holds more cards than its limit. */
export const overLimit = (column: BoardColumn, count: number): boolean => column.limit > 0 && count > column.limit;
