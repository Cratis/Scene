// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// What placement needs to work out where an action's slice opens: what the action asks for, what the slice's screen fits,
/// where the inputs come from, and the slots the page has.
/// </summary>
/// <param name="Slice">The qualified id of the slice the action runs, such as <c language="csharp">Catalog.Products.SetProductPrice</c>.</param>
/// <param name="Inputs">The command's inputs and where each gets its value.</param>
/// <param name="Slots">The slots of the page the action sits on, in the order the page declares them.</param>
/// <param name="Opens">Where the action asks the screen to open; automatic when <see langword="null"/>.</param>
/// <param name="OpensIn">The slot the action names, when it opens in a slot.</param>
/// <param name="Screen">The name of the slice's screen; <see langword="null"/> when the slice has none, so it can only run directly.</param>
/// <param name="Fits">The places the screen fits, in order of preference; <see langword="null"/> or empty fits a dialog.</param>
/// <param name="RouteValues">The values of the page's route parameters, used to show the URL a routed slot produces.</param>
public record PlacementRequest(
    string Slice,
    IReadOnlyList<PlacementInput> Inputs,
    IReadOnlyList<PlacementSlot> Slots,
    Opens? Opens = null,
    string? OpensIn = null,
    string? Screen = null,
    IReadOnlyList<ScreenFit>? Fits = null,
    IReadOnlyDictionary<string, string>? RouteValues = null);
