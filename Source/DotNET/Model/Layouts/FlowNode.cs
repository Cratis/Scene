// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A node in a <see cref="FlowArrangement"/>'s tree: a container (<see cref="FlowRow"/>, <see cref="FlowColumn"/>,
/// <see cref="FlowGrid"/>) or a leaf positioning one of the slot's own content elements (<see cref="FlowLeaf"/>).
/// </summary>
public abstract record FlowNode
{
    /// <summary>
    /// Gets how much this node grows relative to its siblings when there is extra space to distribute, or
    /// <see langword="null"/> to not participate in growth.
    /// </summary>
    public double? Grow { get; init; }

    /// <summary>
    /// Gets how many tracks this node spans in an ancestor <see cref="FlowGrid"/>, or <see langword="null"/> for a single track.
    /// </summary>
    public int? Span { get; init; }
}
