// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// One item of an effective collection.
/// </summary>
/// <param name="Id">The item id.</param>
/// <param name="Values">The item's field values.</param>
/// <param name="Origin">The owner or instance the item comes from.</param>
/// <param name="Fixed">Whether the item is fixed - one the consumer cannot remove or change.</param>
public record EffectiveCollectionItem(
    string Id,
    IReadOnlyDictionary<string, JsonElement> Values,
    string Origin,
    bool Fixed);
