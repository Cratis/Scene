// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// Which way a <see cref="FlowContainer"/> arranges its children.
/// </summary>
/// <remarks>
/// C# distinguishes <see cref="FlowRow"/> from <see cref="FlowColumn"/> by type, but the TypeScript mirror
/// cannot: interfaces with identical members are the same type, and there are no runtime types to test. A
/// renderer walking an arrangement tree would have no way to tell a row from a column - which is the one
/// thing it most needs to know. This carries that decision as data, so both stacks read it the same way.
/// </remarks>
public enum FlowContainerKind
{
    /// <summary>
    /// Children are arranged horizontally.
    /// </summary>
    Row = 0,

    /// <summary>
    /// Children are arranged vertically.
    /// </summary>
    Column = 1,

    /// <summary>
    /// Children are arranged in a two-dimensional grid.
    /// </summary>
    Grid = 2
}
