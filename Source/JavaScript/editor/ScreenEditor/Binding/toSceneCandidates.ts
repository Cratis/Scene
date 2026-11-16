// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryOriginKind, QueryResultShape, type QueryCandidate as SceneQueryCandidate } from '@cratis/scene.model';

// The shape Studio's query discovery produces (StudioIssues#395). Structurally the shared C3 contract.
export interface DiscoveredQueryCandidate {
    id: string;
    name: string;
    origin: { kind: string; id: string; name: string }[];
    parameters: { name: string; type: string; required: boolean }[];
    resultShape: string;
    resultFields: { name: string; type: string; isIdentity?: boolean }[];
}

const shapes = new Set<string>(Object.values(QueryResultShape));
const kinds = new Set<string>(Object.values(QueryOriginKind));

// Hands Studio's discovered candidates to Scene. The two are the same contract, so this only narrows the strings
// to Scene's enumerations - and drops what Scene could not understand rather than guessing at it.
export function toSceneCandidates(candidates: readonly DiscoveredQueryCandidate[]): SceneQueryCandidate[] {
    return candidates
        .filter(candidate => shapes.has(candidate.resultShape) && candidate.origin.every(origin => kinds.has(origin.kind)))
        .map(candidate => candidate as unknown as SceneQueryCandidate);
}
