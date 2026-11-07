// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectiveOutlet } from './effectiveOutletResolution';
import { OutletDiagnostic } from './OutletDiagnostic';
import { outletDiagnostics } from './outletDiagnostics';
import { OutletLevel } from './OutletLevel';

/**
 * Checks every outlet of a chain of levels: what resolving each declared outlet reports, then every refinement of an
 * outlet no level above it declares and every contribution to an outlet no level declares.
 * @param chain The levels from the top down; the last is the level the outlets are checked for.
 * @param contributors Levels outside the chain that may contribute to its outlets.
 * @returns The diagnostics: per declared outlet in declaration order, then refinements, then contributions.
 */
export function diagnoseOutlets(chain: OutletLevel[], contributors: OutletLevel[] = []): OutletDiagnostic[] {
    const declared: string[] = [];
    const diagnostics: OutletDiagnostic[] = [];
    for (const level of chain) {
        for (const outlet of level.outlets ?? []) {
            if (!declared.includes(outlet.name)) declared.push(outlet.name);
        }
    }
    for (const outlet of declared) diagnostics.push(...effectiveOutlet(chain, outlet, contributors).diagnostics);

    const declaredAbove = new Set<string>();
    for (const level of chain) {
        for (const refinement of level.refinements ?? []) {
            if (!declaredAbove.has(refinement.outlet)) diagnostics.push(outletDiagnostics.refinementOfUnknownOutlet(refinement.outlet, level.name));
        }
        for (const outlet of level.outlets ?? []) declaredAbove.add(outlet.name);
    }

    for (const level of [...chain, ...contributors]) {
        for (const contribution of level.contributions ?? []) {
            if (!declared.includes(contribution.outlet)) diagnostics.push(outletDiagnostics.contributionToUnknownOutlet(contribution.outlet, level.name));
        }
    }
    return diagnostics;
}
