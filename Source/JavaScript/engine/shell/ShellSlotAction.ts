// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What happens to the content one slot of the current shell holds when the shell is switched. The camelCase values are what hosts show and exchange.
 */
export enum ShellSlotAction {
    /** The new shell has a slot of the same name; the content stays where it is. */
    Keep = 'keep',

    /** The slot is the current shell's primary slot (or is named `content`) and the content follows to the new shell's primary slot under another name. */
    Primary = 'primary',

    /** The user chose to move the content into the new shell's primary slot ("Move into content"). */
    MoveToPrimary = 'moveToPrimary',

    /** The user chose to move the content into another slot of the new shell. */
    MapTo = 'mapTo',

    /** The user chose to drop the content. */
    Drop = 'drop',

    /** The new shell has no matching slot and no screen uses the slot, so nothing needs deciding. */
    Unused = 'unused',

    /** The new shell has no matching slot, screens use the slot and no valid choice was made: the switch is blocked until one is. */
    Unresolved = 'unresolved',
}
