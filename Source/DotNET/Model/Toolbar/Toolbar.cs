// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Toolbar;

/// <summary>
/// The buttons of a toolbar, in order.
/// </summary>
/// <param name="Buttons">The buttons.</param>
public record Toolbar(IReadOnlyList<ToolbarButton> Buttons);
