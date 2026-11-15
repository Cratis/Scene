// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataPack, SampleDataSet } from '@cratis/scene.model';

/** A read model of the board as the preview knows it: its name and its JSON schema. */
export interface PreviewReadModel {
    readonly name: string;
    readonly schema: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

const rowCount = 3;
const childRowCount = 3;

// The schema a property or an array's items stand for: a reference to a definition of the schema is followed.
const resolve = (node: unknown, root: Record<string, unknown>): Record<string, unknown> | undefined => {
    if (!isRecord(node)) return undefined;
    const reference = node.$ref;
    if (typeof reference !== 'string' || !reference.startsWith('#/')) return node;
    const target = reference.slice(2).split('/').reduce<unknown>((current, segment) => isRecord(current) ? current[segment] : undefined, root);
    return isRecord(target) ? target : undefined;
};

const words = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase();

const uuid = (seed: string, index: number): string => {
    let hash = 2166136261;
    for (const character of `${seed}:${index}`) hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619) >>> 0;
    const hex = (value: number, length: number) => (value >>> 0).toString(16).padStart(length, '0').slice(-length);
    const a = hash, b = Math.imul(a, 2654435761), c = Math.imul(b, 2246822519), d = Math.imul(c, 3266489917);
    return `${hex(a, 8)}-${hex(b >>> 16, 4)}-4${hex(b, 3)}-8${hex(c >>> 16, 3)}-${hex(c, 4)}${hex(d, 8)}`;
};

// One value of a scalar property, plausible for what the property is called and typed as, the same for the same row every time.
function valueOf(name: string, node: Record<string, unknown>, owner: string, index: number): unknown {
    const concept = typeof node['x-concept'] === 'string' ? node['x-concept'] : '';
    const hint = `${name} ${concept}`.toLowerCase();
    if (Array.isArray(node.enum) && node.enum.length > 0) return node.enum[index % node.enum.length];
    if (node.format === 'uuid' || /(^|\b)(id|guid)$/.test(name.toLowerCase()) && node.type === 'string') return uuid(`${owner}.${name}`, index);
    if (node.format === 'date-time') return `2026-10-${String(10 + index).padStart(2, '0')}T09:30:00Z`;
    if (node.format === 'date') return `2026-10-${String(10 + index).padStart(2, '0')}`;
    if (node.type === 'boolean') return index % 2 === 0;
    if (node.type === 'integer') return /quantity|qty|count|lines|items/.test(hint) ? index + 1 : 10 * (index + 1);
    if (node.type === 'number') return /price|amount|total|cost|value|sum/.test(hint) ? [49, 89, 349][index % 3] : (index + 1) * 2.5;
    if (/sku|code/.test(hint)) return `ACM-${1000 + index}`;
    if (/mail/.test(hint)) return `person${index + 1}@example.com`;
    return `${words(name).replace(/^./, letter => letter.toUpperCase())} ${index + 1}`;
}

function rowsOf(schema: Record<string, unknown>, root: Record<string, unknown>, owner: string, count: number, depth: number): Record<string, unknown>[] {
    const properties = isRecord(schema.properties) ? schema.properties : {};
    return Array.from({ length: count }, (_, index) => {
        const row: Record<string, unknown> = {};
        for (const [name, definition] of Object.entries(properties)) {
            const node = resolve(definition, root);
            if (!node) continue;
            if (node.type === 'array') {
                const items = resolve(node.items, root);
                if (items && items.type !== 'object' && !isRecord(items.properties)) row[name] = [valueOf(name, items, owner, index)];
                else row[name] = items && depth < 2 ? rowsOf(items, root, `${owner}.${name}`, childRowCount, depth + 1) : [];
            } else if (node.type === 'object' || isRecord(node.properties)) {
                row[name] = depth < 2 ? rowsOf(node, root, `${owner}.${name}`, 1, depth + 1)[0] : {};
            } else {
                row[name] = valueOf(name, node, owner, index);
            }
        }

        return row;
    });
}

const hasCollectionOfRecords = (schema: Record<string, unknown>, root: Record<string, unknown>): boolean =>
    Object.values(isRecord(schema.properties) ? schema.properties : {}).some(definition => {
        const node = resolve(definition, root);
        if (node?.type !== 'array') return false;
        const items = resolve(node.items, root);
        return items !== undefined && (items.type === 'object' || isRecord(items.properties));
    });

/**
 * The rows of the read models that hold a collection of records, with the records in it - which a pack cannot give, because a row of a pack holds scalars only
 * (Cratis/Screenplay#1000) - so a screen that lists a read model's own lines (`rows from query AllBaskets.0.lines`) has something to list in a preview.
 *
 * @param models The read models of the board.
 * @returns A set per read model with a collection of records, its rows made from the schema.
 */
export function sampleSetsOfCollections(models: readonly PreviewReadModel[]): SampleDataSet[] {
    const sets = new Map<string, SampleDataSet>();
    for (const model of models) {
        if (!isRecord(model.schema) || sets.has(model.name) || !hasCollectionOfRecords(model.schema, model.schema)) continue;
        sets.set(model.name, { shape: model.name, rows: rowsOf(model.schema, model.schema, model.name, rowCount, 0) });
    }

    return [...sets.values()];
}

/**
 * The packs with the sets of the pack in effect completed by those the pack does not hold: an author's own rows for a read model are never replaced, only
 * what the pack says nothing about is filled in. Without a pack in effect nothing is added, since nothing would read it.
 *
 * @param packs Every pack available.
 * @param activePack The pack in effect, or empty for the generated data.
 * @param sets The sets to complete it with.
 * @returns The packs; the same array when nothing is added.
 */
export function withCollectionSets(packs: SampleDataPack[], activePack: string, sets: readonly SampleDataSet[]): SampleDataPack[] {
    if (sets.length === 0 || activePack === '') return packs;
    const pack = packs.find(candidate => candidate.id === activePack);
    if (!pack) return packs;
    const missing = sets.filter(set => !(pack.sets ?? []).some(existing => existing.shape === set.shape));
    if (missing.length === 0) return packs;
    return packs.map(candidate => candidate === pack ? { ...candidate, sets: [...(candidate.sets ?? []), ...missing] } : candidate);
}
