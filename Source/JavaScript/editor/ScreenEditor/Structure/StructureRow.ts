// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// One visible line of the structure tree.
export interface StructureRow<T> {
    node: T;
    id: string;
    depth: number;
    parentId: string | null;
    hasChildren: boolean;
    isExpanded: boolean;
}
