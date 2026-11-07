// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where the screen of the slice an action runs opens. The placement resolver that picks a fit for `Automatic` is not
 * part of this release yet; the value is stored so a model keeps what its author chose.
 */
export enum Opens {
    /** The first fit the page has free; the default. */
    Automatic = 'automatic',

    /** Run the slice's command directly, with no screen: Screenplay's `runs`. */
    None = 'none',

    /** In a dialog over the page. */
    Dialog = 'dialog',

    /** In a drawer over the page. */
    Drawer = 'drawer',

    /** In a slot of the page, named by the action's `opensIn`. */
    Slot = 'slot',
}
