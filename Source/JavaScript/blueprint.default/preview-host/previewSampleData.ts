// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, SampleDataPack, SampleShape } from '@cratis/scene.model';
import { BindingResolver, SampleDataResolution, resolveSampleData } from '@cratis/scene.engine';
import type { SliceCommandField } from '@cratis/scene.react';
import { ApplicationDocument } from './ApplicationDocument';
import { previewProfile } from './previewProfile';

/**
 * Which sample data a preview shows (spec 11, PRV6). The active pack is the application profile's (`sampleData.activePack`),
 * chosen once for the whole application; `sessionActivePack` is the preview strip's selector, a session-only override of that
 * setting - not a second source of truth. Resolution is `resolveSampleData`'s: bound pack, active pack, the blueprint's default
 * pack, then generated data, and the same seed gives the same rows every time.
 */
export interface PreviewSampleData {
    /** Every pack available: the blueprints' and the author's own. */
    packs: SampleDataPack[];

    /** The preview strip's choice for this session: a pack id, or the empty string for generated data. Absent leaves the profile's. */
    sessionActivePack?: string;

    /** The default pack of the blueprint the templates came from. */
    blueprintDefaultPack?: string;

    /** The locale of generated data when no pack supplies one. */
    locale?: string;

    /** The seed for generated data; 1 by default, so previews are stable. */
    seed?: number;

    /** The number of generated rows. */
    rowCount?: number;

    /** The shape of the rows of each read model or query, by name, for generating rows where no pack has them. */
    shapes?: Record<string, SampleShape>;
}

/** What a preview reads its data from. */
export interface PreviewSampleDataSource {
    /** The rows for a read model or query; empty when nothing supplies any. */
    rows(target: string, shape?: SampleShape): SampleDataResolution;

    /** The rows of every query the document binds, by query name - the `queryResults` of the render scope. */
    queryResults: Record<string, unknown>;

    /** Resolves a binding that names a query against the sample rows. */
    resolveBinding: BindingResolver;

    /** Starting values for a command's fields from the sample rows, for the task dialog of a slice. */
    commandFields(command: string, fields: SliceCommandField[]): SliceCommandField[];
}

const noSample: PreviewSampleData = { packs: [] };

/** The names of the queries a document binds: every `query` it names, in bindings and on components. */
export function collectQueryNames(value: unknown): string[] {
    const names = new Set<string>();
    const visit = (candidate: unknown) => {
        if (candidate === null || typeof candidate !== 'object') return;
        if (Array.isArray(candidate)) {
            candidate.forEach(visit);
            return;
        }

        for (const [key, entry] of Object.entries(candidate as Record<string, unknown>)) {
            if (key === 'query' && typeof entry === 'string' && entry.length > 0) names.add(entry);
            else visit(entry);
        }
    };

    visit(value);
    return [...names];
}

/**
 * The read models a Screenplay screen shows - the `typeName` of its data, table and summary elements - and, for a data element, the query it names. A pack's
 * shapes are the rows of a read model by its name, so these are what a table or summary is given rows by; the query a data element names is given the same rows.
 */
export function collectTypeNames(value: unknown): { typeNames: string[]; queries: Record<string, string> } {
    const typeNames = new Set<string>();
    const queries: Record<string, string> = {};
    const visit = (candidate: unknown) => {
        if (candidate === null || typeof candidate !== 'object') return;
        if (Array.isArray(candidate)) {
            candidate.forEach(visit);
            return;
        }

        const properties = (candidate as { properties?: unknown }).properties;
        if (properties !== null && typeof properties === 'object') {
            const { typeName, query } = properties as { typeName?: unknown; query?: unknown };
            if (typeof typeName === 'string' && typeName.length > 0) {
                typeNames.add(typeName);
                if (typeof query === 'string' && query.length > 0) queries[query] = typeName;
            }
        }

        Object.values(candidate as Record<string, unknown>).forEach(visit);
    };

    visit(value);
    return { typeNames: [...typeNames], queries };
}

function readPath(source: unknown, path: string): unknown {
    if (!path) return source;
    return path.split('.').reduce<unknown>((current, segment) => {
        if (current === null || current === undefined || typeof current !== 'object') return undefined;
        if (Array.isArray(current)) return /^(0|[1-9][0-9]*)$/.test(segment) ? current[Number(segment)] : undefined;
        return Object.hasOwn(current, segment) ? (current as Record<string, unknown>)[segment] : undefined;
    }, source);
}

function shapeOfFields(name: string, fields: SliceCommandField[]): SampleShape {
    return { name, fields: fields.map(field => ({ name: field.name, type: field.type })) };
}

function scalar(value: unknown): string | number | boolean | undefined {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
}

/**
 * Plugs the sample data resolution into what a preview renders with (PRV6). Nothing here decides what a row looks like - that is
 * `resolveSampleData` - this only asks it, with the application profile's selection, for the queries the document binds and the
 * commands its slices accept. It is design/preview time only: a production host never builds one (SD6).
 *
 * @param application The document whose profile carries the selection and whose bindings are scanned.
 * @param sample The packs, session override and seed.
 */
export function createPreviewSampleData(application: ApplicationDocument, sample: PreviewSampleData = noSample): PreviewSampleDataSource {
    const profile = previewProfile(application.uiProfiles);
    const context = {
        packs: sample.packs,
        profile,
        sessionActivePack: sample.sessionActivePack,
        blueprintDefaultPack: sample.blueprintDefaultPack,
        locale: sample.locale,
        seed: sample.seed,
        rowCount: sample.rowCount,
        isDesignOrPreview: true,
    };

    const rows = (target: string, shape?: SampleShape): SampleDataResolution => {
        const known = shape ?? sample.shapes?.[target];
        const resolved = resolveSampleData({ target, ...(known === undefined ? {} : { shape: known }) }, context);
        if (resolved.rows.length > 0 || !target.includes('.')) return resolved;

        const short = target.slice(target.lastIndexOf('.') + 1);
        return resolveSampleData({ target: short, ...(known === undefined ? {} : { shape: known }) }, context);
    };

    const queryResults: Record<string, unknown> = {};
    for (const name of collectQueryNames([application.screens, application.screenTemplates, application.dialogTemplates ?? [], application.layouts])) {
        const resolved = rows(name);
        if (resolved.rows.length > 0) queryResults[name] = resolved.rows;
    }

    // A table or a summary of a Screenplay screen shows a read model by name, so it is given that read model's rows; the query its data element names too.
    const shown = collectTypeNames([application.screens, application.screenTemplates, application.dialogTemplates ?? [], application.layouts]);
    for (const typeName of shown.typeNames) {
        const resolved = rows(typeName);
        if (resolved.rows.length > 0) queryResults[typeName] = resolved.rows;
    }

    for (const [query, typeName] of Object.entries(shown.queries)) {
        if (queryResults[query] === undefined && queryResults[typeName] !== undefined) queryResults[query] = queryResults[typeName];
    }

    return {
        rows,
        queryResults,
        resolveBinding: (binding: BindingExpression) => binding.query ? readPath(queryResults[binding.query], binding.path) : undefined,
        // A field starts with the value the application's sample data gives it: the command's own sample row when a pack names the command, then the same
        // property in the rows the screens already show (an SKU, a currency, an order number the application seeds), and only then what was generated
        // from the field's name - words with no meaning for the property.
        commandFields: (command, fields) => {
            const resolved = rows(command, shapeOfFields(command, fields));
            const own = resolved.source === 'generated' ? undefined : resolved.rows[0];
            const generated = resolved.source === 'generated' ? resolved.rows[0] : undefined;
            if (!own && !generated) return fields;

            const shown = Object.values(queryResults).flatMap(result => Array.isArray(result) ? result as Record<string, unknown>[] : []);
            const valueIn = (row: Record<string, unknown> | undefined, name: string): string | number | boolean | undefined => {
                const key = row === undefined ? undefined : Object.keys(row).find(candidate => candidate.toLowerCase() === name.toLowerCase());
                return key === undefined ? undefined : scalar(row![key]);
            };

            return fields.map(field => {
                const value = valueIn(own, field.name)
                    ?? shown.map(row => valueIn(row, field.name)).find(candidate => candidate !== undefined)
                    ?? valueIn(generated, field.name);
                return value === undefined ? field : { ...field, initialValue: value };
            });
        },
    };
}
