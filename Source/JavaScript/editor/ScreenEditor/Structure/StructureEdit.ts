// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Moves a node under a new parent (or to the top level when `targetParentId` is null).
// `index` is the position among the target's children once the node has been taken out of its old place.
export interface StructureEdit {
    nodeId: string;
    targetParentId: string | null;
    index: number;
}
