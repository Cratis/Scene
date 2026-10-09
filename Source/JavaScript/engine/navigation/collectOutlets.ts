// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationDiagnostic } from './NavigationDiagnostic';
import { NavigationDiagnosticCode } from './NavigationDiagnosticCode';
import { NavigationGraph } from './NavigationGraph';
import { OutletOwner } from './OutletOwner';

/**
 * Indexes every declared outlet by name, keeping the first declaration and reporting each later one as a
 * duplicate - a destination names an outlet only by name, so two of them are ambiguous.
 */
export function collectOutlets(graph: NavigationGraph, diagnostics: NavigationDiagnostic[]): Map<string, OutletOwner> {
    const owners = new Map<string, OutletOwner>();
    const surfaces = [
        ...(graph.layouts ?? []).map(layout => ({ name: layout.name, kind: 'Layout' as const, outlets: layout.outlets ?? [] })),
        ...(graph.screenTemplates ?? []).map(template => ({ name: template.name, kind: 'ScreenTemplate' as const, outlets: template.outlets ?? [] })),
    ];

    for (const surface of surfaces) {
        for (const outlet of surface.outlets) {
            const existing = owners.get(outlet.name);
            if (existing) {
                diagnostics.push({
                    code: NavigationDiagnosticCode.DuplicateOutlet,
                    message: `Outlet '${outlet.name}' is declared by both '${existing.owner}' and '${surface.name}'; destinations cannot tell them apart.`,
                });
                continue;
            }

            owners.set(outlet.name, { outlet, owner: surface.name, ownerKind: surface.kind });
        }
    }

    return owners;
}
