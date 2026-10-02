// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isIconReference } from '@cratis/scene.model';
import { AffectedIconUsage, IconImpactReport, LegacyIconUsage } from './IconImpactReport';
import { EffectiveIconCatalog } from './EffectiveIconCatalog';
import { IconUsage } from './IconUsage';

/**
 * Reports what changing a profile's icon libraries - removing one, upgrading one to a version that dropped
 * icons, swapping one - would do to icon values already persisted, without touching them.
 *
 * Build `proposed` from the packages the profile would have after the change (with
 * {@link resolveIconLibraries} and that package set's catalog sources) and compare it with the `current`
 * one. A reference is *affected* when it does not resolve in `proposed`; `wasResolvable` says whether it did in
 * `current`. Legacy bare strings are listed with the icons in `proposed` that share their name, but are never
 * counted as affected and never rewritten - migrating them is an author's decision, one reference at a time.
 */
export async function analyzeIconImpact(usages: IconUsage[], current: EffectiveIconCatalog, proposed: EffectiveIconCatalog): Promise<IconImpactReport> {
    const affected: AffectedIconUsage[] = [];
    const legacy: LegacyIconUsage[] = [];
    let unaffectedCount = 0;

    for (const usage of usages) {
        if (!isIconReference(usage.value)) {
            legacy.push({ usage, candidates: await proposed.findByName(String(usage.value)) });
            continue;
        }

        const after = await proposed.resolve(usage.value);
        if (after.isResolved) {
            unaffectedCount++;
            continue;
        }

        const before = await current.resolve(usage.value);
        affected.push({ usage, diagnostic: after.diagnostic, wasResolvable: before.isResolved });
    }

    return { affected, unaffectedCount, legacy };
}
