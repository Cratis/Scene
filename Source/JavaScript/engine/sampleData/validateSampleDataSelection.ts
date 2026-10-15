// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPack, SampleDataSelection } from '@cratis/scene.model';

/**
 * Checks an application's sample data selection against the packs available: the active pack and every bound
 * pack must exist, mappings and bindings must be complete and not repeated, and one read model must not be fed
 * by two different shapes. The C# engine (`SampleDataValidation.ValidateSelection`) reports the same problems in
 * the same order.
 */
export function validateSampleDataSelection(selection: SampleDataSelection, packs: readonly SampleDataPack[]): string[] {
    const problems: string[] = [];
    const known = new Set(packs.map(pack => pack.id));

    if (selection.activePack !== undefined && selection.activePack !== null && !known.has(selection.activePack)) {
        problems.push(`The active sample data pack '${selection.activePack}' is not available`);
    }

    const pairs = new Set<string>();
    const shapeByReadModel = new Map<string, string>();
    for (const mapping of selection.mappings ?? []) {
        if ((mapping.shape ?? '').trim() === '') {
            problems.push('A sample data mapping declares no shape');
        } else if ((mapping.readModel ?? '').trim() === '') {
            problems.push(`The sample data mapping for shape '${mapping.shape}' declares no read model`);
        } else if (pairs.has(`${mapping.shape}\u0000${mapping.readModel}`)) {
            problems.push(`The sample data mapping '${mapping.shape}' to '${mapping.readModel}' is declared more than once`);
        } else {
            pairs.add(`${mapping.shape}\u0000${mapping.readModel}`);
            const existing = shapeByReadModel.get(mapping.readModel);
            if (existing === undefined) {
                shapeByReadModel.set(mapping.readModel, mapping.shape);
            } else {
                problems.push(`The read model '${mapping.readModel}' is mapped from both shape '${existing}' and shape '${mapping.shape}'`);
            }
        }
    }

    const targets = new Set<string>();
    for (const binding of selection.bindings ?? []) {
        if ((binding.target ?? '').trim() === '') {
            problems.push('A sample data binding declares no target');
        } else if (targets.has(binding.target)) {
            problems.push(`The sample data target '${binding.target}' is bound more than once`);
        } else {
            targets.add(binding.target);
            if (!known.has(binding.pack)) {
                problems.push(`The sample data binding for '${binding.target}' names pack '${binding.pack ?? ''}', which is not available`);
            }
        }
    }

    return problems;
}
