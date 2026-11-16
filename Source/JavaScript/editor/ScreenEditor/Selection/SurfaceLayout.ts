// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How the surface of a screen arranges the elements placed on it, written beside the screen document so a reader that
 * only draws thumbnails can tell how the screen flows.
 *
 * The numbers are the ones the earlier prototype layout used, so a host that still stores that layout converts with a
 * plain number cast.
 */
export enum SurfaceLayout {
    absolute = 0,
    flexRow = 1,
    flexColumn = 2,
    grid = 3,
}
