// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What kind of region a {@link Slot} is, which tells a renderer how much of the page it takes and how it behaves.
 */
export enum SlotRole {
    /** The whole page: the region a screen replaces when someone navigates. */
    Page = 'page',

    /** A region next to others on the page, such as a detail pane beside a list. */
    Pane = 'pane',

    /** A panel that slides in over or next to the page and can be closed, such as a drawer. */
    Panel = 'panel',
}
