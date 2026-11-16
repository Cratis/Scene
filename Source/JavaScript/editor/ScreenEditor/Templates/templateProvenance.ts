// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProvenanceKind, type SceneDocument, type SceneElement } from '@cratis/scene.model';
import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import { Ownership } from '../Structure/Ownership';
import type { OwnershipResolver } from '../Structure/OwnershipResolver';
import { everyElementId } from '../Selection/sceneTree';
import { isSlotSection } from './slotSections';

// Scene's own answer to "whose is this?", turned into the editor's ownership vocabulary.
export function ownershipOfProvenance(kind: `${ProvenanceKind}`): Ownership {
    switch (kind) {
        case ProvenanceKind.Inherited: return Ownership.Inherited;
        case ProvenanceKind.ConfigurableInherited: return Ownership.ConfigurableInherited;
        default: return Ownership.Local;
    }
}

// Resolves ownership for every element in the composition by asking Scene to inspect it, so the editor can never
// disagree with the engine about what is locked. An element Scene does not know is treated as inherited: locking by
// mistake is recoverable, editing something the engine will refuse is not.
export function resolveOwnership(document: SceneDocument, roots: SceneElement[], context: EditingContext): OwnershipResolver {
    const byId = new Map<string, Ownership>();
    for (const id of everyElementId(roots)) {
        // The place a slot of the authored template is drawn in is the author's: it is where what goes into the slot goes.
        if (isSlotSection(id)) {
            byId.set(id, Ownership.Local);
            continue;
        }

        const inspection = inspect(document, elementNodeId(id), context);
        byId.set(id, inspection ? ownershipOfProvenance(inspection.provenance.kind) : Ownership.Inherited);
    }

    return id => byId.get(id) ?? Ownership.Local;
}
