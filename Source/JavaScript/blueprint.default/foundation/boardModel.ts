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

    /** The card's numeric fields (a deal's `amount`), which a column can total. */
    numbers: Record<string, number>;
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

/**
 * Which properties of a row say what a card shows, for rows that come from a query with a shape of their own (a product with `productId`, `name`,
 * `status`) instead of the card shape (`id`, `title`, `column`). A name left out falls back to the card shape's own.
 */
export interface BoardCardFields {
    /** The property that identifies the card. */
    id?: string;

    /** The property that names the card. */
    title?: string;

    /** The property that holds the id of the column the card is in. */
    column?: string;

    /** The property that holds who the card is assigned to. */
    assignee?: string;

    /** Up to three properties shown on the card, each with the label it is shown under (the property's name when no label is given). */
    fields?: { field: string; label?: string }[];
}

const textOfValue = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : typeof value === 'number' && Number.isFinite(value) ? String(value) : typeof value === 'boolean' ? String(value) : undefined;

const cardIdOf = (entry: Record<string, unknown>, mapping: BoardCardFields): string | undefined =>
    mapping.id ? textOfValue(entry[mapping.id]) : typeof entry.id === 'string' ? entry.id : undefined;

const cardTitleOf = (entry: Record<string, unknown>, mapping: BoardCardFields): string | undefined =>
    mapping.title ? textOfValue(entry[mapping.title]) : typeof entry.title === 'string' ? entry.title : undefined;

/** Reads the original query rows by card id, keeping the first row for each id. */
export function readCardRows(value: unknown, mapping: BoardCardFields = {}): Map<string, Record<string, unknown>> {
    const rows = new Map<string, Record<string, unknown>>();
    for (const entry of records(value)) {
        const id = cardIdOf(entry, mapping);
        if (cardTitleOf(entry, mapping) === undefined) continue;
        if (id !== undefined && id.length > 0 && !rows.has(id)) rows.set(id, entry);
    }
    return rows;
}

/** Reads the mapping of an element's `cardFields` list: entries with a `field`, repeated fields dropped. */
export function readCardFieldList(value: unknown): { field: string; label?: string }[] {
    const seen = new Set<string>();
    return records(value).flatMap(entry => {
        if (typeof entry.field !== 'string' || entry.field.length === 0 || seen.has(entry.field)) return [];
        seen.add(entry.field);
        return [{ field: entry.field, ...(typeof entry.label === 'string' && entry.label.length > 0 ? { label: entry.label } : {}) }];
    });
}

/**
 * Reads cards, dropping those without an id or a title, keeping at most three key fields. With `mapping`, the id, title, column, assignee and the key
 * fields are read from the named properties of each row, so a query row needs no card shape of its own.
 */
export function readCards(value: unknown, mapping: BoardCardFields = {}): BoardCard[] {
    const seen = new Set<string>();
    const mapped = (mapping.fields ?? []).length > 0;
    return records(value).flatMap(entry => {
        const id = cardIdOf(entry, mapping);
        const title = cardTitleOf(entry, mapping);
        if (id === undefined || id.length === 0 || seen.has(id) || title === undefined) return [];
        seen.add(id);
        const fields = mapped
            ? (mapping.fields ?? []).flatMap(field => { const shown = textOfValue(entry[field.field]); return shown === undefined ? [] : [{ label: field.label ?? field.field, value: shown }]; }).slice(0, 3)
            : records(entry.fields).flatMap(field => (typeof field.label === 'string' && typeof field.value === 'string' ? [{ label: field.label, value: field.value }] : [])).slice(0, 3);
        const column = textOfValue(mapping.column ? entry[mapping.column] : entry.column) ?? '';
        const assignee = mapping.assignee ? textOfValue(entry[mapping.assignee]) : typeof entry.assignee === 'string' ? entry.assignee : undefined;
        return [{
            id, title, column, fields,
            numbers: Object.fromEntries(Object.entries(entry).filter((pair): pair is [string, number] => typeof pair[1] === 'number' && Number.isFinite(pair[1]))),
            badges: Array.isArray(entry.badges) ? entry.badges.filter((badge): badge is string => typeof badge === 'string') : [],
            ...(assignee !== undefined ? { assignee } : {}),
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

/** The sum of a numeric card field over the cards in a column; a card without the field adds nothing. */
export const totalOf = (cards: BoardCard[], field: string): number => cards.reduce((sum, card) => sum + (card.numbers[field] ?? 0), 0);

export const overLimit = (column: BoardColumn, count: number): boolean => column.limit > 0 && count > column.limit;

/** One horizontal lane of a board: the cards of one person, laid across the same columns as every other lane. */
export interface BoardLane {
    key: string;
    /** The assignee, or an empty string for the cards that have none. */
    assignee: string;
    cards: BoardCard[];
}

/**
 * Splits the cards into lanes by assignee, in the order the people first appear, with the unassigned cards last - so the lanes do not jump about as cards move,
 * and a person whose last card moves away keeps their lane (an empty one is shown by the caller, not dropped here).
 */
export function lanesByAssignee(cards: BoardCard[], people: string[]): BoardLane[] {
    const order = [...new Set([...people, ...cards.flatMap(card => (card.assignee ? [card.assignee] : []))])];
    const lanes: BoardLane[] = order.map(assignee => ({ key: assignee, assignee, cards: cards.filter(card => card.assignee === assignee) }));
    const unassigned = cards.filter(card => !card.assignee);
    return unassigned.length > 0 ? [...lanes, { key: '', assignee: '', cards: unassigned }] : lanes;
}
