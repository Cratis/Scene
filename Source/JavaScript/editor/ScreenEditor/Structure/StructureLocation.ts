// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Where a node sits in the tree.
export interface StructureLocation<T> {
    node: T;
    parent: T | null;
    index: number;
    siblings: T[];
}
