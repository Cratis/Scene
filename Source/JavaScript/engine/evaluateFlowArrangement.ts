// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, FlowNode, FlowOverride, SizeClass } from '@cratis/scene.model';

/**
 * Selects the {@link FlowNode} tree that applies for a given {@link SizeClass} - part of Cratis/Scene#4.
 *
 * @param arrangement The {@link FlowArrangement} to evaluate.
 * @param sizeClass The current {@link SizeClass}.
 * @returns The most specific matching override's root (both dimensions targeted beats one; the last declared wins among equally specific matches), or `arrangement.root` when no override matches.
 */
export function evaluateFlowArrangement(arrangement: FlowArrangement, sizeClass: SizeClass): FlowNode {
    let best: FlowOverride | undefined;
    for (const candidate of arrangement.overrides ?? []) {
        if (!matches(candidate, sizeClass)) {
            continue;
        }

        if (!best || specificity(candidate) >= specificity(best)) {
            best = candidate;
        }
    }

    return best?.root ?? arrangement.root;
}

function matches(override: FlowOverride, sizeClass: SizeClass): boolean {
    return (override.width === undefined || override.width === sizeClass.width) &&
        (override.height === undefined || override.height === sizeClass.height);
}

function specificity(override: FlowOverride): number {
    return (override.width !== undefined ? 1 : 0) + (override.height !== undefined ? 1 : 0);
}
