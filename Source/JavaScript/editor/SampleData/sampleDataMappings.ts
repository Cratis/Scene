// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataMapping, SampleDataPack } from '@cratis/scene.model';
import { SampleDataMappingRow } from './SampleDataMappingRow';

/**
 * The shapes the packs in play carry data for - every shape of the active pack, in order, each once.
 *
 * @param packs Every pack that can be chosen, own and blueprint.
 * @param activePack The active pack identifier, or empty for none.
 * @returns The shape names.
 */
export function shapesOfActivePack(packs: readonly SampleDataPack[], activePack: string): string[] {
    const pack = packs.find(candidate => candidate.id === activePack);
    return pack ? [...new Set(pack.sets.map(set => set.shape))] : [];
}

/**
 * The mapping table: a row for each shape of the active pack, saying which read model it stands in for. A shape whose
 * name already is a read model of the application needs no mapping; every other shape needs one before its rows can be
 * used, and the table shows it with nothing chosen.
 *
 * @param shapes The shapes of the active pack.
 * @param readModels The names of the application's read models.
 * @param mappings The mappings in the selection.
 * @returns One row per shape.
 */
export function describeMappingRows(shapes: readonly string[], readModels: readonly string[], mappings: readonly SampleDataMapping[]): SampleDataMappingRow[] {
    return shapes.map(shape => ({
        shape,
        readModel: mappings.find(mapping => mapping.shape === shape)?.readModel ?? '',
        matchesByName: readModels.includes(shape),
    }));
}

/**
 * The mappings after a shape is mapped to a read model, or after its mapping is cleared (an empty read model).
 *
 * @param mappings The mappings in the selection.
 * @param shape The shape.
 * @param readModel The read model it stands in for, or empty to remove the mapping.
 * @returns The new mappings; the shape's old one is replaced rather than repeated.
 */
export function mapShape(mappings: readonly SampleDataMapping[], shape: string, readModel: string): SampleDataMapping[] {
    const others = mappings.filter(mapping => mapping.shape !== shape);
    return readModel === '' ? others : [...others, { shape, readModel }];
}
