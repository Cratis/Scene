// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Adds a screen template (template mode): its slots, how they are arranged, and the item outlets it offers.
/// </summary>
/// <param name="Name">The template's name.</param>
/// <param name="Slots">Its slots.</param>
/// <param name="DisplayName">What it is called.</param>
/// <param name="Description">What it is for.</param>
/// <param name="FitsSlot">The slot of its parent it fills.</param>
/// <param name="Type">Its semantic type.</param>
/// <param name="Arrangement">How its slots are arranged, as Scene JSON.</param>
/// <param name="Outlets">The item outlets it offers, as Scene JSON.</param>
public record AddTemplateOperation(
    string Name,
    IReadOnlyList<DesignSlot> Slots,
    string? DisplayName = null,
    string? Description = null,
    string? FitsSlot = null,
    string? Type = null,
    JsonElement? Arrangement = null,
    IReadOnlyList<JsonElement>? Outlets = null) : DesignOperation
{
    /// <inheritdoc/>
    public override string Op => "addTemplate";
}
