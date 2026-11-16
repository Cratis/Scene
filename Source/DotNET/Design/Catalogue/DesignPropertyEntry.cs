// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// One property of a component, as the catalogue answers it.
/// </summary>
/// <param name="Name">The property path.</param>
/// <param name="Label">What it is called.</param>
/// <param name="Kind">The kind of value it takes.</param>
/// <param name="Choices">The values a choice property takes - already limited to what the design system declares for the variant property.</param>
/// <param name="Required">Whether it must have a value.</param>
/// <param name="Description">What it is for.</param>
/// <param name="Minimum">The least a number may be.</param>
/// <param name="Maximum">The most a number may be.</param>
public record DesignPropertyEntry(
    string Name,
    string Label,
    DesignValueKind Kind,
    IReadOnlyList<JsonElement>? Choices = null,
    bool? Required = null,
    string? Description = null,
    double? Minimum = null,
    double? Maximum = null);
