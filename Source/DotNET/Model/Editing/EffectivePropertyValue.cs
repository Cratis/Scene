// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// The value a property has once an instance's contributions are applied, and where it comes from.
/// </summary>
/// <param name="Path">The path of the property.</param>
/// <param name="Value">The effective value.</param>
/// <param name="Source">Where the effective value comes from.</param>
/// <param name="InheritedValue">The value without the instance's contribution.</param>
/// <param name="ContributedBy">The instance that contributed the value.</param>
/// <param name="Items">For a collection, the effective items.</param>
public record EffectivePropertyValue(
    string Path,
    JsonElement? Value,
    ValueSource Source,
    JsonElement? InheritedValue,
    string? ContributedBy = null,
    IReadOnlyList<EffectiveCollectionItem>? Items = null);
