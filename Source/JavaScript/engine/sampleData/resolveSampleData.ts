// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPack } from '@cratis/scene.model';
import { generateSample } from './generateSample';
import { defaultSampleLocale } from './sampleLocales';
import { findSampleDataSet } from './findSampleDataSet';
import { SampleDataContext, SampleDataDiagnostic, SampleDataRequest, SampleDataResolution } from './SampleDataResolution';

/**
 * Resolves the rows to show for a read model or shape at design or preview time, by the order of spec §11.2:
 *
 * 1. the pack bound to the target (`profile.sampleData.bindings`, a rare override);
 * 2. the application's active pack: the UI profile's `sampleData.activePack`, chosen once for the whole
 *    application, or the session-only override (`context.sessionActivePack`) the preview strip sets;
 * 3. the default pack of the blueprint the template came from (`blueprintDefaultPack`);
 * 4. generated data typed by field kind ({@link generateSample}), when the request carries a shape.
 *
 * A pack supplies rows when it has a set for the target, by an explicit `shape → read model` mapping or else by
 * name ({@link findSampleDataSet}). A rung that cannot supply rows falls through to the next; an unknown pack
 * id, or a bound pack without the target's shape, is reported in `diagnostics` (an active or blueprint pack
 * that merely lacks the shape is normal and not reported). The locale carried is the supplying pack's; for
 * generated data it is the first existing bound, active or blueprint pack's, else `context.locale`.
 *
 * Outside design and preview (`context.isDesignOrPreview` not true) nothing resolves (spec SD6).
 */
export function resolveSampleData(request: SampleDataRequest, context: SampleDataContext): SampleDataResolution {
    const target = request.target ?? request.shape?.name ?? '';
    const fallbackLocale = context.locale ?? defaultSampleLocale;
    const diagnostics: SampleDataDiagnostic[] = [];

    if (context.isDesignOrPreview !== true) {
        return { source: 'disabled', locale: fallbackLocale, rows: [], diagnostics };
    }

    const packs = context.packs ?? [];
    const selection = context.profile?.sampleData;
    const mappings = selection?.mappings ?? [];
    const find = (id: string | null | undefined): SampleDataPack | undefined => (id === undefined || id === null ? undefined : packs.find(pack => pack.id === id));
    const missing = (id: string, role: string): void => {
        diagnostics.push({ code: 'packNotFound', message: `The ${role} sample data pack '${id}' is not available` });
    };

    const bindingPackId = (selection?.bindings ?? []).find(binding => binding.target === target)?.pack;
    const bindingPack = find(bindingPackId);
    if (bindingPackId !== undefined && bindingPack === undefined) {
        missing(bindingPackId, `bound`);
    } else if (bindingPack !== undefined) {
        const set = findSampleDataSet(bindingPack, target, mappings);
        if (set !== undefined) return fromSet('binding', bindingPack, set.shape, set.rows, diagnostics);
        diagnostics.push({ code: 'shapeNotInPack', message: `The bound sample data pack '${bindingPack.id}' has no rows for '${target}'` });
    }

    const activePackId = context.sessionActivePack !== undefined ? context.sessionActivePack : selection?.activePack;
    const activePack = find(activePackId);
    if (activePackId !== undefined && activePackId !== null && activePack === undefined) {
        missing(activePackId, 'active');
    } else if (activePack !== undefined) {
        const set = findSampleDataSet(activePack, target, mappings);
        if (set !== undefined) return fromSet('activePack', activePack, set.shape, set.rows, diagnostics);
    }

    const blueprintPackId = context.blueprintDefaultPack;
    const blueprintPack = find(blueprintPackId);
    if (blueprintPackId !== undefined && blueprintPackId !== null && blueprintPack === undefined) {
        missing(blueprintPackId, 'blueprint default');
    } else if (blueprintPack !== undefined) {
        const set = findSampleDataSet(blueprintPack, target, mappings);
        if (set !== undefined) return fromSet('blueprintDefault', blueprintPack, set.shape, set.rows, diagnostics);
    }

    const locale = bindingPack?.locale ?? activePack?.locale ?? blueprintPack?.locale ?? fallbackLocale;
    if (request.shape === undefined) {
        return { source: 'none', locale, shape: target, rows: [], diagnostics };
    }

    return {
        source: 'generated',
        locale,
        shape: request.shape.name,
        rows: generateSample(request.shape, context.seed, context.rowCount, locale),
        diagnostics,
    };
}

function fromSet(
    source: 'binding' | 'activePack' | 'blueprintDefault',
    pack: SampleDataPack,
    shape: string,
    rows: Record<string, unknown>[],
    diagnostics: SampleDataDiagnostic[],
): SampleDataResolution {
    return { source, pack: pack.id, locale: pack.locale, shape, rows: structuredClone(rows), diagnostics };
}
