// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FreeformSlotArrangement, FreeformSlotVariant, SizeClass } from '@cratis/scene.model';

/**
 * Selects the {@link FreeformSlotVariant} that targets a given {@link SizeClass} - the counterpart to
 * {@link evaluateFreeformArrangement} for a `Layout`'s own macro `arrangement`, which places the layout's
 * slots themselves rather than the content of one slot.
 *
 * @param arrangement The {@link FreeformSlotArrangement} to evaluate.
 * @param sizeClass The current {@link SizeClass}.
 * @returns The variant whose size class exactly matches, or `undefined` when nothing targets it. There is deliberately no fallback here - a size class with no matching variant is a design-time/build-time warning elsewhere, never a silently picked variant.
 */
export function evaluateFreeformSlotArrangement(arrangement: FreeformSlotArrangement, sizeClass: SizeClass): FreeformSlotVariant | undefined {
    return arrangement.variants.find(variant => variant.sizeClass.width === sizeClass.width && variant.sizeClass.height === sizeClass.height);
}
