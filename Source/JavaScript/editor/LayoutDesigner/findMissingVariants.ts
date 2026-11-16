// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FreeformArrangement, SizeClass } from '@cratis/scene.model';
import { evaluateFreeformArrangement } from '@cratis/scene.engine';

/**
 * Finds every size class in `targetSizeClasses` that a {@link FreeformArrangement} has no matching
 * `variant` for - part of StudioIssues#161's missing-variant warning, surfaced directly on the
 * device/orientation picker. Reuses `evaluateFreeformArrangement` (Cratis/Scene#4) unmodified: a size
 * class is missing exactly when evaluating against it resolves nothing, the same "no fallback, only a
 * warning" rule the engine already enforces at runtime.
 *
 * @param arrangement The {@link FreeformArrangement} to check.
 * @param targetSizeClasses The size classes the active `ui profile` targets.
 * @returns The size classes with no matching variant.
 */
export function findMissingVariants(arrangement: FreeformArrangement, targetSizeClasses: SizeClass[]): SizeClass[] {
    return targetSizeClasses.filter(sizeClass => evaluateFreeformArrangement(arrangement, sizeClass) === undefined);
}
