// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { LayoutArrangement } from '../Layouts/LayoutArrangement';
import type { Ownership } from './Ownership';

// Teaches the structure tools how to read and rebuild one concrete screen model. The structure logic - validation,
// moves, drop regions - works on this seam instead of on a model, so the same rules serve the editor's current
// element tree and the shared Scene model it is moving toward.
export interface StructureTreeAdapter<T> {
    idOf(node: T): string;
    nameOf(node: T): string;
    childrenOf(node: T): T[];

    // Returns the node with its children replaced, preserving everything else about it.
    withChildren(node: T, children: T[]): T;

    acceptsChildren(node: T): boolean;
    ownershipOf(node: T): Ownership;

    // How the node arranges its children, or undefined when it does not say.
    arrangementOf(node: T): LayoutArrangement | undefined;

    // What a tree whose nodes are choices rather than elements says after the name - the current choice - and how many problems the node owns.
    // A tree of elements leaves both out.
    detailOf?(node: T): string | undefined;
    problemsOf?(node: T): number;

    // Whether the node may be dragged at all, beyond what its ownership allows. A tree whose shape is fixed answers false.
    isMovable?(node: T): boolean;
}
