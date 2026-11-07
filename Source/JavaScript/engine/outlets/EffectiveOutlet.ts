// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletKind, OutletMode, OutletSubject } from '@cratis/scene.model';
import { EffectiveOutletItem } from './EffectiveOutletItem';
import { OutletDiagnostic } from './OutletDiagnostic';
import { RemovedOutletItem } from './RemovedOutletItem';

/**
 * An outlet resolved for the last level of a chain: its items in order with where each comes from, the inherited items
 * that level's chain hid or overrode, and a summary such as "Catalog + Products".
 */
export interface EffectiveOutlet {
    /** The name of the outlet. */
    name: string;

    /** What the outlet lists; absent when no level declares it. */
    kind?: OutletKind;

    /** What the outlet's actions act on, when it has a subject. */
    subject?: OutletSubject;

    /** The slot the outlet owns, when it owns one. */
    slot?: string;

    /** The name of the level that declares the outlet; absent when none does. */
    declaredBy?: string;

    /** How the last level treats the outlet; absent when that level declares it. */
    mode?: OutletMode;

    /** The items, in order. */
    items: EffectiveOutletItem[];

    /** The inherited items that are hidden or overridden, in the order they were removed. */
    removed: RemovedOutletItem[];

    /** The names of the levels that shaped the outlet, in order: the declaring level, then each level that extended, overrode or contributed. */
    sources: string[];

    /** The sources joined for a region tag, such as `Catalog + Products`. */
    summary: string;

    /** What is wrong with the outlet along the chain. */
    diagnostics: OutletDiagnostic[];
}
