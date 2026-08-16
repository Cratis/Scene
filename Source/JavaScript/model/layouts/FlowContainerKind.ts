// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Which way a {@link FlowContainer} arranges its children.
 *
 * C# distinguishes `FlowRow` from `FlowColumn` by type, but this mirror cannot: interfaces with identical
 * members are the same type, and there are no runtime types to test. A renderer walking an arrangement
 * tree would have no way to tell a row from a column — which is the one thing it most needs to know. This
 * carries that decision as data, so both stacks read it the same way.
 */
export enum FlowContainerKind {
    Row = 'Row',
    Column = 'Column',
    Grid = 'Grid',
}
