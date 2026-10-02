// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveIconEntry } from './EffectiveIconEntry';
import { IconDiagnostic } from './IconDiagnostic';
import { IconUsage } from './IconUsage';

/**
 * A reference the proposed change would leave without an icon.
 */
export interface AffectedIconUsage {
    /**
     * The usage that would break.
     */
    usage: IconUsage;

    /**
     * Why it would no longer resolve.
     */
    diagnostic: IconDiagnostic;

    /**
     * Whether it resolved before the change. `false` marks a reference that was already broken, so a
     * report can tell new damage from old.
     */
    wasResolvable: boolean;
}

/**
 * A legacy bare icon string the report leaves untouched, with the icons it could be migrated to.
 */
export interface LegacyIconUsage {
    /**
     * The usage holding the legacy string.
     */
    usage: IconUsage;

    /**
     * The icons in the proposed catalog whose name or key equals the string. Empty means nothing to
     * migrate to; more than one means the author has to choose a library.
     */
    candidates: EffectiveIconEntry[];
}

/**
 * What a library change would do to a set of persisted icon values. It describes; it never rewrites.
 */
export interface IconImpactReport {
    /**
     * References that resolve now (or did) and would not after the change.
     */
    affected: AffectedIconUsage[];

    /**
     * How many references resolve after the change.
     */
    unaffectedCount: number;

    /**
     * Legacy strings, which are neither affected nor rewritten by a library change.
     */
    legacy: LegacyIconUsage[];
}
