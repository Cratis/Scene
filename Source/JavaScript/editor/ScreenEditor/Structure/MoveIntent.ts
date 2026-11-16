// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The keyboard-friendly vocabulary for moving a node, as an alternative to dragging it.
export enum MoveIntent {
    MoveUp = 'moveUp',
    MoveDown = 'moveDown',

    // Make the node a sibling of its parent, right after it.
    Outdent = 'outdent',

    // Make the node the last child of the sibling before it.
    Indent = 'indent',
}
