// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// What inspection knows about a slice an action can run: its screen, what the screen fits, its command's inputs and the
/// policy the command authorizes with.
/// </summary>
/// <param name="Id">The qualified id of the slice.</param>
/// <param name="Inputs">The command's inputs, each with the source the slice's hooks feed it from.</param>
/// <param name="Command">The command the slice submits, which a hand-authored action names instead of the slice.</param>
/// <param name="Screen">The name of the slice's screen; <see langword="null"/> when it has none.</param>
/// <param name="Fits">The places the screen fits, in order.</param>
/// <param name="Authorize">The policy the command authorizes with, when it has one.</param>
public record ActionSlice(
    string Id,
    IReadOnlyList<PlacementInput> Inputs,
    string? Command = null,
    string? Screen = null,
    IReadOnlyList<ScreenFit>? Fits = null,
    string? Authorize = null);
