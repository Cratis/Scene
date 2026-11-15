// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Which way the insertion marker is drawn.
export enum InsertionAxis {

    // A horizontal line - siblings are stacked top to bottom.
    Horizontal = 'horizontal',

    // A vertical bar - siblings run left to right.
    Vertical = 'vertical',

    // No marker: placement is by position, not by order.
    None = 'none',
}
