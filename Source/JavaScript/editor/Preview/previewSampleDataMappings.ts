// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataMapping, UiProfile } from '@cratis/scene.model';

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * The shape to query pairs the screens of a document bind.
 *
 * A screen asks for its rows by the name of the query (`data PipelineOrder[] via query AllPipelineOrders`), and Scene's preview host resolves the rows of a
 * query by that name: a set of a pack supplies them when its shape is named like the query, or when a mapping says its shape stands in for it. A sample
 * data pack is written in terms of read models - `shape PipelineOrder` - and the UI profile's `shape X maps to <ReadModel>` can only name a read model, never a
 * query, so without help the rows of the pack never reach a screen and every table and board of the preview says "Nothing here yet". The data element
 * of a screen knows both: the query it reads and the read model (`typeName`) it yields. That pair is the mapping.
 *
 * @param content Anything that holds screens: the screens, the templates, the layouts of a document.
 * @returns One mapping per distinct query and read model, in the order they are met.
 */
export function queryShapeMappingsOf(content: unknown): SampleDataMapping[] {
    const found = new Map<string, SampleDataMapping>();
    const visit = (candidate: unknown): void => {
        if (Array.isArray(candidate)) {
            candidate.forEach(visit);
            return;
        }

        if (!isRecord(candidate)) return;
        const properties = candidate.properties;
        if (typeof candidate.componentName === 'string' && /(^|:)data$/.test(candidate.componentName) && isRecord(properties)) {
            const { query, typeName } = properties;
            if (typeof query === 'string' && query.length > 0 && typeof typeName === 'string' && typeName.length > 0 && query !== typeName) {
                found.set(`${typeName}\u0000${query}`, { shape: typeName, readModel: query });
            }
        }

        Object.values(candidate).forEach(visit);
    };

    visit(content);
    return [...found.values()];
}

/**
 * The profile with the mappings its screens' queries need added to the application's own, which stay first and win: an author who mapped a shape by hand
 * keeps what they chose. The profile the application stores is never changed; this is what the preview draws with.
 *
 * @param profile The profile the application previews with.
 * @param content Anything that holds the screens the preview draws.
 * @returns The profile to preview with.
 */
export function profileWithQueryMappings(profile: UiProfile, content: unknown): UiProfile {
    const derived = queryShapeMappingsOf(content);
    if (derived.length === 0) return profile;

    const own = profile.sampleData?.mappings ?? [];
    const taken = new Set(own.map(mapping => `${mapping.shape}\u0000${mapping.readModel}`));
    const added = derived.filter(mapping => !taken.has(`${mapping.shape}\u0000${mapping.readModel}`));
    if (added.length === 0) return profile;

    return { ...profile, sampleData: { activePack: profile.sampleData?.activePack, bindings: profile.sampleData?.bindings ?? [], mappings: [...own, ...added] } };
}
