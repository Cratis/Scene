// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// One screen template a screen may be built on.
/// </summary>
/// <param name="Name">The template's name.</param>
/// <param name="Outlets">What each of its outlets takes.</param>
/// <param name="DisplayName">What it is called.</param>
/// <param name="Description">What it is for.</param>
/// <param name="Type">Its semantic type.</param>
/// <param name="Category">The category it is browsed under.</param>
/// <param name="FitsSlot">The slot of its parent it fills.</param>
public record DesignTemplateEntry(
    string Name,
    IReadOnlyList<DesignOutletRule> Outlets,
    string? DisplayName = null,
    string? Description = null,
    string? Type = null,
    string? Category = null,
    string? FitsSlot = null);
