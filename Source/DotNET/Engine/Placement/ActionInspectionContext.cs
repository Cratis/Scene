// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// The page and the state the actions of an outlet or an <c language="csharp">action</c> component are inspected against.
/// </summary>
/// <param name="Slices">The slices the actions can run.</param>
/// <param name="Slots">The slots of the page the actions sit on.</param>
/// <param name="RouteValues">The values of the page's route parameters.</param>
/// <param name="Selected">Whether an item is selected.</param>
/// <param name="Item">The selected item.</param>
/// <param name="Persona">The persona the actions are shown to; <see langword="null"/> leaves authorization unchecked.</param>
/// <param name="Conditions">Whether each action's <c language="screenplay">enabled when</c> holds, by action id, when the host evaluated it.</param>
public record ActionInspectionContext(
    IReadOnlyList<ActionSlice> Slices,
    IReadOnlyList<PlacementSlot> Slots,
    IReadOnlyDictionary<string, string>? RouteValues = null,
    bool? Selected = null,
    JsonElement? Item = null,
    EnablementPersona? Persona = null,
    IReadOnlyDictionary<string, bool>? Conditions = null);
