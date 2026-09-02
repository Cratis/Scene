// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// Lays its children out against its edges, each child stating which edge through the <c>Dock</c> key
/// of its <see cref="SceneElement.Properties"/>.
/// </summary>
public record DockPanel : Panel
{
    /// <summary>
    /// Gets whether the last child spreads into whatever space the docked children left behind.
    /// </summary>
    public bool LastChildFill { get; init; } = true;
}
