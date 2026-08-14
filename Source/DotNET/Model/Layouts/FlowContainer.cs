// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A <see cref="FlowNode"/> that arranges child nodes (<see cref="FlowRow"/>, <see cref="FlowColumn"/> or
/// <see cref="FlowGrid"/>).
/// </summary>
public abstract record FlowContainer : FlowNode
{
    /// <summary>
    /// Gets the space reserved between adjacent children.
    /// </summary>
    public double Gap { get; init; }

    /// <summary>
    /// Gets the container's children, in order.
    /// </summary>
    public IReadOnlyList<FlowNode> Children { get; init; } = [];
}
