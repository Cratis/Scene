// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The edge a {@link Dock} is anchored to.
 *
 * This is an enum rather than a union of string literals so the four edges are discoverable from the type
 * itself and a `switch` over them stays exhaustive: adding a fifth edge becomes a compile error at every
 * place that maps an edge onto a position, instead of a silently missing case. The values are the same
 * lowercase words a screen authors, so an authored `position` maps straight onto a member.
 */
export enum DockPosition {
    /**
     * Anchored to the top edge, laid out across.
     */
    Top = 'top',

    /**
     * Anchored to the bottom edge, laid out across. The macOS-style default.
     */
    Bottom = 'bottom',

    /**
     * Anchored to the left edge, laid out down.
     */
    Left = 'left',

    /**
     * Anchored to the right edge, laid out down.
     */
    Right = 'right',
}
