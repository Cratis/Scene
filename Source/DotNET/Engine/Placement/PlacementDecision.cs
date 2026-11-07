// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Where an action's slice opens, and why: what <see cref="PlacementResolver.Resolve"/> decided.
/// </summary>
/// <param name="Requested">What the action asked for.</param>
/// <param name="Routed">Whether opening it changes the URL. Dialogs and drawers are never routed.</param>
/// <param name="Reason">Why, such as <c language="csharp">Drawer: the slice's first fit, and the page has room</c>.</param>
/// <param name="RunDirectly">Whether the slice could run directly.</param>
/// <param name="Slots">Every slot of the page as an <c language="csharp">In a slot</c> choice, in the page's order.</param>
/// <param name="Resolved">Where the slice opens: never automatic. <see langword="null"/> when it cannot be placed, and <paramref name="Problem"/> says why.</param>
/// <param name="Fit">The place of the screen's fits it opens in, when it opens a screen.</param>
/// <param name="Slot">The slot it opens in, when it opens in a slot.</param>
/// <param name="Route">What it adds to the route, when it opens in a routed slot.</param>
/// <param name="Problem">What prevents the slice from opening where the action asks; <see langword="null"/> when it can.</param>
public record PlacementDecision(
    Opens Requested,
    bool Routed,
    string Reason,
    RunDirectly RunDirectly,
    IReadOnlyList<SlotOption> Slots,
    Opens? Resolved = null,
    ScreenFit? Fit = null,
    string? Slot = null,
    PlacementRoute? Route = null,
    PlacementProblem? Problem = null);
