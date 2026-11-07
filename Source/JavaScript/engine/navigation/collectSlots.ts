// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationDiagnostic } from './NavigationDiagnostic';
import { NavigationDiagnosticCode } from './NavigationDiagnosticCode';
import { NavigationGraph } from './NavigationGraph';
import { SlotOwner } from './SlotOwner';

/**
 * Indexes every declared routed slot by name, keeping the first declaration and reporting each later one as a
 * duplicate - a destination names a slot only by name, so two of them are ambiguous. Slots that are not routed are
 * filled by composition, not navigation, and are not destinations.
 */
export function collectSlots(graph: NavigationGraph, diagnostics: NavigationDiagnostic[]): Map<string, SlotOwner> {
    const owners = new Map<string, SlotOwner>();
    const surfaces = [
        ...(graph.layouts ?? []).map(layout => ({ name: layout.name, kind: 'Layout' as const, slots: (layout.slots ?? []).filter(slot => slot.routed === true) })),
        ...(graph.screenTemplates ?? []).map(template => ({ name: template.name, kind: 'ScreenTemplate' as const, slots: (template.slots ?? []).filter(slot => slot.routed === true) })),
    ];

    for (const surface of surfaces) {
        for (const slot of surface.slots) {
            const existing = owners.get(slot.name);
            if (existing) {
                diagnostics.push({
                    code: NavigationDiagnosticCode.DuplicateSlot,
                    message: `Slot '${slot.name}' is declared by both '${existing.owner}' and '${surface.name}'; destinations cannot tell them apart.`,
                });
                continue;
            }

            owners.set(slot.name, { slot, owner: surface.name, ownerKind: surface.kind });
        }
    }

    return owners;
}
