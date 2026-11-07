// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// What enablement needs to work out whether an action can be used.
/// </summary>
/// <param name="Subject">What the action acts on; an action for an item waits for a selection. <see langword="null"/> acts on the screen.</param>
/// <param name="Selected">Whether an item is selected.</param>
/// <param name="Item">The selected item, which a structured <paramref name="Condition"/> is evaluated against.</param>
/// <param name="Authorize">The policy the command authorizes with, when it has one.</param>
/// <param name="Persona">The persona the action is shown to; <see langword="null"/> leaves authorization unchecked.</param>
/// <param name="EnabledWhen">The action's <c language="screenplay">enabled when</c> condition as written, such as <c language="csharp">item.status == "onSale"</c>.</param>
/// <param name="Condition">The condition in its structured guard form, evaluated against <paramref name="Item"/>.</param>
/// <param name="ConditionHolds">Whether the condition holds, when the host evaluated it; it wins over <paramref name="Condition"/>.</param>
public record EnablementRequest(
    OutletSubject? Subject = null,
    bool? Selected = null,
    JsonElement? Item = null,
    string? Authorize = null,
    EnablementPersona? Persona = null,
    string? EnabledWhen = null,
    JsonElement? Condition = null,
    bool? ConditionHolds = null);
