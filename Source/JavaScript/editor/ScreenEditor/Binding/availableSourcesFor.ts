// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryCandidate } from '@cratis/scene.model';

// The values a screen's queries and actions can be fed from, by path and type: the row an action was activated on, the
// row selected in a table, and route values - named after the query parameters the screen's scope can use, so a query
// that needs an `equipmentId` finds `route.equipmentId` waiting for it.
export function availableSourcesFor(candidates: readonly QueryCandidate[]): Record<string, string> {
    const sources: Record<string, string> = { 'row.id': 'Guid', 'selection.id': 'Guid' };
    for (const candidate of candidates) {
        for (const parameter of candidate.parameters) {
            sources[`route.${parameter.name}`] ??= parameter.type;
        }
    }

    return sources;
}
