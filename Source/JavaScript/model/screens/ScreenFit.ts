// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A place a slice's screen fits: Screenplay's `fits dialog, drawer, pane`. A screen lists them in order of preference,
 * and placement takes the first one the page has free when an action opens the screen automatically.
 *
 * A dialog and a drawer sit over the page, so every page has them. A page, a pane and a panel are slots of the page,
 * matched by their {@link SlotRole}.
 */
export enum ScreenFit {
    /** A dialog over the page. */
    Dialog = 'dialog',

    /** A drawer over the page. */
    Drawer = 'drawer',

    /** A slot of the page whose role is a pane. */
    Pane = 'pane',

    /** A slot of the page whose role is a panel. */
    Panel = 'panel',

    /** A slot of the page whose role is a page. */
    Page = 'page',
}
