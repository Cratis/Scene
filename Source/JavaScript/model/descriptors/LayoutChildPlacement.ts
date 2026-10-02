// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How a layout type decides where its children go.
 */
export enum LayoutChildPlacement {
    /** It holds no children. */
    None = 'none',

    /** By order: a child's position is its place in the sequence, and the layout reflows. */
    Ordered = 'ordered',

    /** By placement: each child carries its own position and size. */
    Positioned = 'positioned',
}
