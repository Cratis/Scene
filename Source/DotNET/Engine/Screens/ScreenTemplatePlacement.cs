// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Screens;

/// <summary>
/// Where one <see cref="Model.Screens.ScreenTemplate"/> ended up: the slot it declared, and the layout or
/// template that turned out to declare that slot.
/// </summary>
/// <param name="Template">The template being placed.</param>
/// <param name="Slot">The slot name the template declared it fits.</param>
/// <param name="Container">The name of the <see cref="Model.Layouts.Layout"/> or <see cref="Model.Screens.ScreenTemplate"/> declaring that slot.</param>
/// <param name="Depth">How far below the layout the template sits - 1 directly inside the layout, 2 inside a template that is, and so on.</param>
public record ScreenTemplatePlacement(string Template, string Slot, string Container, int Depth);
