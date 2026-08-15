// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// A <see cref="FrameworkElement"/> that lays out an arbitrary number of children.
/// </summary>
public abstract record Panel : FrameworkElement
{
    /// <summary>
    /// Gets the panel's children, in render order.
    /// </summary>
    public IReadOnlyList<SceneElement> Children { get; init; } = [];
}
