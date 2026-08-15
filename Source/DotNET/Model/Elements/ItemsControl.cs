// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// A <see cref="Control"/> that renders one instance of an item template per item in a bound collection.
/// </summary>
public record ItemsControl : Control
{
    /// <summary>
    /// Gets the binding to the collection of items to render.
    /// </summary>
    public required BindingExpression ItemsSource { get; init; }

    /// <summary>
    /// Gets the template rendered once per item.
    /// </summary>
    public required SceneElement ItemTemplate { get; init; }
}
