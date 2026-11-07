// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Slot, SlotRole } from '@cratis/scene.model';

/**
 * The role a slot plays: the one it declares (in any letter case, as a C# host may write `Page`), or - when it declares
 * none - `page` for the primary slot and `pane` for any other. The C# engine answers the same (`SlotRoles.Resolve`).
 * @param slot The slot.
 * @returns The slot's role.
 */
export function resolveSlotRole(slot: Slot): SlotRole {
    const declared = Object.values(SlotRole).find(role => role === (slot.role as string | undefined)?.toLowerCase());
    if (declared !== undefined) return declared;
    return slot.primary === true ? SlotRole.Page : SlotRole.Pane;
}

/**
 * The name of the slot marked `primary`, or undefined when none is. With more than one marked (which validation
 * reports), the first one wins.
 * @param slots The slots of one layout or screen template.
 * @returns The primary slot's name.
 */
export function primarySlotOf(slots: readonly Slot[] | undefined): string | undefined {
    return slots?.find(slot => slot.primary === true)?.name;
}
