// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** How a column's cell is drawn. */
export enum CellKind {
    Text = 'text',
    Number = 'number',
    Currency = 'currency',
    Date = 'date',
    Status = 'status',
}

/** One column of a list. */
export interface ListColumn {
    field: string;
    header: string;
    kind: CellKind;
    sortable: boolean;
    /** For a status column: the tone of each value (`success`, `warning`, `danger`, `info`, `neutral`). */
    tones: Record<string, string>;
    /** For a currency column: the ISO 4217 code. */
    currency?: string;
}

/** One record of a list, with the field values as the query returned them. */
export type ListRow = Record<string, unknown>;

/** How the list is sorted. */
export interface ListSort {
    field: string;
    descending: boolean;
}

/** The ways the same records can be laid out. */
export enum ListVariant {
    Table = 'table',
    Cards = 'cards',
    Grouped = 'grouped',
}

const records = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];

/** Reads columns, dropping those without a field and repeated fields. */
export function readListColumns(value: unknown): ListColumn[] {
    const seen = new Set<string>();
    return records(value).flatMap(entry => {
        if (typeof entry.field !== 'string' || entry.field.length === 0 || seen.has(entry.field)) return [];
        seen.add(entry.field);
        const tones = typeof entry.tones === 'object' && entry.tones !== null && !Array.isArray(entry.tones)
            ? Object.fromEntries(Object.entries(entry.tones as Record<string, unknown>).filter((pair): pair is [string, string] => typeof pair[1] === 'string')) : {};
        return [{
            field: entry.field,
            header: typeof entry.header === 'string' && entry.header.length > 0 ? entry.header : entry.field,
            kind: (Object.values(CellKind) as string[]).includes(entry.kind as string) ? (entry.kind as CellKind) : CellKind.Text,
            sortable: entry.sortable !== false,
            tones,
            ...(typeof entry.currency === 'string' ? { currency: entry.currency } : {}),
        }];
    });
}

/** Reads the variant, defaulting to the table. */
export const readListVariant = (value: unknown): ListVariant => ((Object.values(ListVariant) as string[]).includes(value as string) ? (value as ListVariant) : ListVariant.Table);

/** The value of a row's field as text for searching and display: a primitive as itself, anything else empty. */
export const textOf = (row: ListRow, field: string): string => {
    const value = row[field];
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
};

/** The id of a row: its `idField`, else its position, so a list without ids still selects and keys sensibly. */
export const rowId = (row: ListRow, index: number, idField: string): string => {
    const value = row[idField];
    return typeof value === 'string' || typeof value === 'number' ? String(value) : `row-${index}`;
};

/** Rows that contain the search text in any shown column, without regard to case or accents; empty search keeps every row. */
export function searchRows(rows: ListRow[], columns: ListColumn[], search: string): ListRow[] {
    const needle = normalize(search);
    if (needle.length === 0) return rows;
    return rows.filter(row => columns.some(column => normalize(textOf(row, column.field)).includes(needle)));
}

/** Rows that satisfy a filter of conditions joined by AND or OR, in nested groups - the value the filter builder publishes. */
export function filterRows(rows: ListRow[], filter: unknown): ListRow[] {
    if (typeof filter !== 'object' || filter === null) return rows;
    const group = filter as { operator?: string; conditions?: { field: string; operator: string; value: string }[]; groups?: unknown[] };
    const tests = [
        ...(group.conditions ?? []).filter(condition => typeof condition?.field === 'string').filter(active).map(condition => (row: ListRow) => satisfies(row, condition)),
        ...(group.groups ?? []).filter(nested => hasConditions(nested)).map(nested => (row: ListRow) => filterRows([row], nested).length === 1),
    ];
    if (tests.length === 0) return rows;
    return rows.filter(row => (group.operator === 'or' ? tests.some(test => test(row)) : tests.every(test => test(row))));
}

const active = (condition: { operator: string; value: string }) => ['isEmpty', 'true', 'false'].includes(condition.operator) || (condition.value ?? '').trim().length > 0;
const hasConditions = (group: unknown): boolean => {
    const candidate = group as { conditions?: { operator: string; value: string }[]; groups?: unknown[] } | null;
    return (candidate?.conditions ?? []).some(active) || (candidate?.groups ?? []).some(hasConditions);
};

function satisfies(row: ListRow, condition: { field: string; operator: string; value: string }): boolean {
    const raw = row[condition.field];
    const text = normalize(typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean' ? String(raw) : '');
    const value = normalize(condition.value ?? '');
    const number = Number(raw);
    const wanted = Number(condition.value);
    switch (condition.operator) {
        case 'contains': return text.includes(value);
        case 'equals': case 'is': case 'on': return typeof raw === 'number' ? number === wanted : text === value;
        case 'notEquals': case 'isNot': return typeof raw === 'number' ? number !== wanted : text !== value;
        case 'startsWith': return text.startsWith(value);
        case 'isEmpty': return text.length === 0;
        case 'greater': return number > wanted;
        case 'greaterOrEqual': return number >= wanted;
        case 'less': return number < wanted;
        case 'lessOrEqual': return number <= wanted;
        case 'before': return text < value;
        case 'after': return text > value;
        case 'true': return raw === true || text === 'true';
        case 'false': return raw === false || text === 'false';
        default: return true;
    }
}

function normalize(text: string): string {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
}

/** Reads a sort from its address form, `field` or `-field` for descending; a field that is not a sortable column is no sort at all. */
export function parseSort(text: string | undefined, columns: ListColumn[]): ListSort | undefined {
    if (!text) return undefined;
    const descending = text.startsWith('-');
    const field = descending ? text.slice(1) : text;
    return columns.some(column => column.field === field && column.sortable) ? { field, descending } : undefined;
}

/** A sort in its address form. */
export const formatSort = (sort: ListSort | undefined): string | undefined => (sort === undefined ? undefined : `${sort.descending ? '-' : ''}${sort.field}`);

/** The next sort when a header is pressed: ascending, then descending, then none. */
export const nextSort = (current: ListSort | undefined, field: string): ListSort | undefined =>
    current?.field !== field ? { field, descending: false } : current.descending ? undefined : { field, descending: true };

/** Rows in order of a column, numbers as numbers and text by the locale, with ties kept in their original order. */
export function sortRows(rows: ListRow[], sort: ListSort | undefined, locale: string): ListRow[] {
    if (!sort) return rows;
    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    return rows.map((row, index) => ({ row, index })).sort((left, right) => {
        const a = left.row[sort.field];
        const b = right.row[sort.field];
        const order = typeof a === 'number' && typeof b === 'number' ? a - b : collator.compare(textOf(left.row, sort.field), textOf(right.row, sort.field));
        return (order === 0 ? left.index - right.index : sort.descending ? -order : order);
    }).map(entry => entry.row);
}

/** The slice of rows on a page (1-based), and how many pages there are; a page out of range is clamped rather than empty. */
export function paginate<T>(rows: T[], page: number, pageSize: number): { rows: T[]; page: number; pages: number } {
    const size = pageSize > 0 ? Math.floor(pageSize) : rows.length || 1;
    const pages = Math.max(1, Math.ceil(rows.length / size));
    const clamped = Math.min(Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)), pages);
    return { rows: rows.slice((clamped - 1) * size, clamped * size), page: clamped, pages };
}

/** A group of rows with a subtotal, for the grouped variant. */
export interface ListGroup {
    key: string;
    rows: ListRow[];
    subtotal?: number;
}

/** Groups rows by a field in the order the groups are first seen, with the sum of a numeric field as the subtotal when one is named. */
export function groupRows(rows: ListRow[], groupBy: string, totalField?: string): ListGroup[] {
    const groups: ListGroup[] = [];
    for (const row of rows) {
        const key = textOf(row, groupBy);
        const group = groups.find(candidate => candidate.key === key) ?? (groups.push({ key, rows: [] }), groups[groups.length - 1]);
        group.rows.push(row);
    }

    return totalField === undefined ? groups : groups.map(group => ({ ...group, subtotal: group.rows.reduce((sum, row) => sum + (typeof row[totalField] === 'number' ? (row[totalField] as number) : 0), 0) }));
}

/** Toggles an id in a selection that allows one or many. */
export const toggleSelection = (selected: string[], id: string, multiple: boolean): string[] =>
    selected.includes(id) ? selected.filter(candidate => candidate !== id) : multiple ? [...selected, id] : [id];

/** Reads a selection from its address form: ids separated by commas. */
export const parseSelection = (text: string | undefined): string[] => (text ? text.split(',').filter(id => id.length > 0) : []);
