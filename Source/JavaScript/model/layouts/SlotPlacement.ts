// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The absolute position and size of one of a {@link Layout}'s own named {@link Slot}s within a
 * {@link FreeformSlotVariant} - the counterpart to {@link ElementPlacement}, which places an element
 * within a single slot's own content instead of placing a slot within the layout.
 */
export interface SlotPlacement {
    slotName: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export const SlotPlacementPropertyNames: (keyof SlotPlacement)[] = ['slotName', 'x', 'y', 'width', 'height'];
