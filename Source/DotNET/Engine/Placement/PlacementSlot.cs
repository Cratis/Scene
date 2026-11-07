// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// A slot of the page an action sits on, as placement sees it: its role, whether the page's own content already fills it,
/// and whether it is routed. <see cref="PlacementResolver.SlotsOf"/> builds these from a layout's or template's slots.
/// </summary>
/// <param name="Name">The name of the slot.</param>
/// <param name="Role">What kind of region the slot is.</param>
/// <param name="Filled">Whether the page's own content fills the slot, so nothing else can open in it. A routed slot is never full.</param>
/// <param name="Routed">Whether opening something in the slot changes the URL.</param>
/// <param name="RoutedBy">The route parameters the routed slot is addressed by, in order.</param>
public record PlacementSlot(
    string Name,
    SlotRole Role,
    bool? Filled = null,
    bool? Routed = null,
    IReadOnlyList<string>? RoutedBy = null);
