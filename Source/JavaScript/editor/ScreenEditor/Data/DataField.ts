// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryOriginKind, type QueryCandidate } from '@cratis/scene.model';
import { commandNameOf, type StateChangeSlice } from '../Actions/StateChangeSlice';

// A property of the command the screen submits.
export interface CommandDataField {
    source: 'command';
    sliceId: string;
    command: string;
    property: string;
    type: string;
}

// A field of what one of the queries the slice can read returns.
export interface QueryDataField {
    source: 'query';
    queryId: string;
    query: string;
    field: string;
    type: string;
}

// A whole query: dropping a list query makes a table over it, and dropping a query that returns one result makes a summary of it.
export interface QueryResultDataField {
    source: 'queryResult';
    queryId: string;
    query: string;
    shape: 'collection' | 'single' | 'optional-single';
}

// Something the screen can show or take, which dropping onto the screen turns into a bound field.
export type DataField = CommandDataField | QueryDataField | QueryResultDataField;

// The data a screen can be bound to, the way the Data drawer lists it: the command first, then the queries.
export interface ScreenData {
    command?: { name: string; fields: readonly CommandDataField[] };
    queries: readonly { id: string; name: string; shape: QueryResultDataField['shape']; fields: readonly QueryDataField[] }[];
}

export const dataFieldKey = (field: DataField): string => {
    switch (field.source) {
        case 'command': return `command:${field.sliceId}:${field.property}`;
        case 'queryResult': return `queryResult:${field.queryId}`;
        case 'query': return `query:${field.queryId}:${field.field}`;
    }
};

export const dataFieldLabel = (field: DataField): string => {
    switch (field.source) {
        case 'command': return field.property;
        case 'queryResult': return field.query;
        case 'query': return `${field.query} ▸ ${field.field}`;
    }
};

const isSliceOf = (candidate: QueryCandidate, sliceId: string) =>
    candidate.origin.some(origin => origin.kind === QueryOriginKind.Slice && origin.id === sliceId);

// What a slice's screen can be bound to: the properties of the slice's command, in the order the command declares them, and then what each
// query the slice can read returns - the slice's own queries first, then the rest its feature offers.
export function screenDataOf(sliceId: string | undefined, slices: readonly StateChangeSlice[], candidates: readonly QueryCandidate[]): ScreenData {
    const slice = sliceId ? slices.find(candidate => candidate.id === sliceId) : undefined;
    const command = slice
        ? {
            name: commandNameOf(slice),
            fields: slice.inputs.map<CommandDataField>(input => ({ source: 'command', sliceId: slice.id, command: commandNameOf(slice), property: input.name, type: input.type })),
        }
        : undefined;
    const ordered = sliceId
        ? [...candidates.filter(candidate => isSliceOf(candidate, sliceId)), ...candidates.filter(candidate => !isSliceOf(candidate, sliceId))]
        : [...candidates];
    const queries = ordered
        .filter(candidate => candidate.resultFields.length > 0)
        .map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            shape: candidate.resultShape as QueryResultDataField['shape'],
            fields: candidate.resultFields.map<QueryDataField>(result => ({ source: 'query', queryId: candidate.id, query: candidate.name, field: result.name, type: result.type })),
        }));
    return { ...(command ? { command } : {}), queries };
}

export const isDataField = (value: unknown): value is DataField => {
    if (!value || typeof value !== 'object') return false;
    const field = value as { source?: unknown; sliceId?: unknown; property?: unknown; queryId?: unknown; field?: unknown };
    if (field.source === 'command') return typeof field.sliceId === 'string' && typeof field.property === 'string';
    if (field.source === 'query') return typeof field.queryId === 'string' && typeof field.field === 'string';
    if (field.source === 'queryResult') return typeof field.queryId === 'string';
    return false;
};
