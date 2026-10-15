// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataMapping, SampleDataPack, SampleDataSet } from '@cratis/scene.model';

/**
 * Finds the set of a pack that supplies rows for a read model or shape. An explicit mapping whose read model is
 * the target wins; otherwise a set whose shape has the target's name (compared exactly, case-sensitively).
 */
export function findSampleDataSet(pack: SampleDataPack, target: string, mappings: readonly SampleDataMapping[] = []): SampleDataSet | undefined {
    for (const mapping of mappings) {
        if (mapping.readModel !== target) continue;
        const mapped = (pack.sets ?? []).find(set => set.shape === mapping.shape);
        if (mapped !== undefined) return mapped;
    }

    return (pack.sets ?? []).find(set => set.shape === target);
}
