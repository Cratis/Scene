// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What happens to the content one outlet of the current shell holds when the shell is switched. The camelCase values are what hosts show and exchange.
 */
export enum ShellOutletAction {
    /** The new shell has an outlet of the same name; the content stays where it is. */
    Keep = 'keep',

    /** The outlet is the current shell's primary outlet (or is named `content`) and the content follows to the new shell's primary outlet under another name. */
    Primary = 'primary',

    /** The user chose to move the content into the new shell's primary outlet ("Move into content"). */
    MoveToPrimary = 'moveToPrimary',

    /** The user chose to move the content into another outlet of the new shell. */
    MapTo = 'mapTo',

    /** The user chose to drop the content. */
    Drop = 'drop',

    /** The new shell has no matching outlet and no screen uses the outlet, so nothing needs deciding. */
    Unused = 'unused',

    /** The new shell has no matching outlet, screens use the outlet and no valid choice was made: the switch is blocked until one is. */
    Unresolved = 'unresolved',
}
