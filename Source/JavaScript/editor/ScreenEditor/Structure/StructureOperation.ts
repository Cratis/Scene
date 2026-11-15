// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What an author can try to do to a node in the composed screen.
export enum StructureOperation {
    Select = 'select',

    // Change an exposed setting. Never implies structural access.
    Configure = 'configure',

    // Move, reorder or reparent the node.
    Move = 'move',

    // Resize the node.
    Resize = 'resize',

    // Rename, restyle or re-anchor the node.
    Restyle = 'restyle',

    // Put something inside the node.
    Insert = 'insert',

    Delete = 'delete',
}
