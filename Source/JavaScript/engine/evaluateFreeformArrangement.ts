// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FreeformArrangement, FreeformVariant, SizeClass } from '@cratis/scene.model';

/**
 * Selects the {@link FreeformVariant} that targets a given {@link SizeClass} - part of Cratis/Scene#4.
 *
 * @param arrangement The {@link FreeformArrangement} to evaluate.
 * @param sizeClass The current {@link SizeClass}.
 * @returns The variant whose size class exactly matches, or `undefined` when nothing targets it. There is deliberately no fallback here - a size class with no matching variant is a design-time/build-time warning elsewhere, never a silently picked variant.
 */
export function evaluateFreeformArrangement(arrangement: FreeformArrangement, sizeClass: SizeClass): FreeformVariant | undefined {
    return arrangement.variants.find(variant => variant.sizeClass.width === sizeClass.width && variant.sizeClass.height === sizeClass.height);
}
