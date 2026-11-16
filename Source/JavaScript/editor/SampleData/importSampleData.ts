// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateSampleDataPack, defaultSampleLocale } from '@cratis/scene.engine';
import type { SampleDataPack, SampleDataSet } from '@cratis/scene.model';
import { userSampleDataOwner } from '@cratis/scene.engine';
import { SampleDataImportFormat } from './SampleDataImportFormat';
import { SampleDataImportResult } from './SampleDataImportResult';

/** What the user said about the data set they are importing. */
export interface SampleDataImportRequest {
    /** The identifier the pack is stored under. */
    id: string;

    /** The title the pack is shown by. */
    title: string;

    /** The locale of the data, or empty for Scene's default. */
    locale?: string;

    /** The shape the rows are for - the name of the read model's shape - when the text does not carry one. */
    shape: string;

    /** The text to read. */
    text: string;

    /** How to read it. */
    format: SampleDataImportFormat;
}

/**
 * Reads a data set the user pasted or loaded into a pack, and checks it with Scene.
 *
 * JSON may be an array of rows, `{ shape, rows }`, or a whole pack (`{ sets: [...] }`); CSV reads its header row as the field
 * names and each following row as typed values (whole and decimal numbers, `true`/`false`, and an empty cell as nothing).
 * Nothing about what is valid is decided here: the pack Scene's `validateSampleDataPack` finds fault with is returned together
 * with its problems and is not to be saved.
 *
 * @param request The text and what the user said about it.
 * @returns The pack and its problems.
 */
export function importSampleData(request: SampleDataImportRequest): SampleDataImportResult {
    const sets = request.format === SampleDataImportFormat.Csv ? readCsv(request) : readJson(request);
    if (typeof sets === 'string') return { problems: [sets] };

    const pack: SampleDataPack = { id: request.id, title: request.title.trim(), locale: request.locale?.trim() || defaultSampleLocale, owner: userSampleDataOwner, sets };
    return { pack, problems: validateSampleDataPack(pack) };
}

function readJson(request: SampleDataImportRequest): SampleDataSet[] | string {
    let parsed: unknown;
    try {
        parsed = JSON.parse(request.text);
    } catch (error) {
        return `The text is not valid JSON: ${error instanceof Error ? error.message : String(error)}`;
    }

    if (Array.isArray(parsed)) return rowsToSets(parsed, request.shape);
    if (parsed !== null && typeof parsed === 'object') {
        const value = parsed as { sets?: unknown; rows?: unknown; shape?: unknown };
        if (Array.isArray(value.sets)) return value.sets.map(set => ({ shape: String((set as SampleDataSet).shape ?? ''), rows: ((set as SampleDataSet).rows ?? []) as Record<string, unknown>[] }));
        if (Array.isArray(value.rows)) return rowsToSets(value.rows, typeof value.shape === 'string' ? value.shape : request.shape);
    }

    return 'The JSON must be an array of rows, an object with `shape` and `rows`, or a pack with `sets`.';
}

function rowsToSets(rows: unknown[], shape: string): SampleDataSet[] | string {
    if (rows.some(row => row === null || typeof row !== 'object' || Array.isArray(row))) return 'Every row must be an object of field values.';
    return [{ shape, rows: rows as Record<string, unknown>[] }];
}

function readCsv(request: SampleDataImportRequest): SampleDataSet[] | string {
    const lines = splitCsv(request.text).filter(cells => cells.some(cell => cell.trim() !== ''));
    if (lines.length === 0) return 'The CSV has no rows.';
    const header = lines[0].map(cell => cell.trim());
    if (header.some(name => name === '')) return 'Every column of the CSV needs a name in the first row.';
    if (new Set(header).size !== header.length) return 'The CSV names a column more than once.';

    const rows = lines.slice(1).map(cells => Object.fromEntries(header.flatMap((name, index) => {
        const value = typedCell(cells[index] ?? '');
        return value === undefined ? [] : [[name, value]];
    })));
    return [{ shape: request.shape, rows }];
}

function typedCell(cell: string): unknown {
    const text = cell.trim();
    if (text === '') return undefined;
    if (text === 'true' || text === 'false') return text === 'true';
    return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : cell;
}

// A small reader for RFC 4180 text: quoted cells may hold commas, line breaks and doubled quotes.
function splitCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < text.length; index++) {
        const character = text[index];
        if (quoted) {
            if (character === '"' && text[index + 1] === '"') { cell += '"'; index++; }
            else if (character === '"') quoted = false;
            else cell += character;
        } else if (character === '"') quoted = true;
        else if (character === ',') { row.push(cell); cell = ''; }
        else if (character === '\n' || character === '\r') {
            if (character === '\r' && text[index + 1] === '\n') index++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else cell += character;
    }
    row.push(cell);
    rows.push(row);
    return rows;
}
