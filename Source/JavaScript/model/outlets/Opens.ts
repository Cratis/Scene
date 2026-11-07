// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Where the screen of the slice an action runs opens: Screenplay's `opens`. Buttons and menu entries of an outlet of
 * actions and the `action` component share it. `resolvePlacement` works out what `Automatic` resolves to, and checks an
 * explicit choice against what the slice's screen fits and the slots the page has.
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
