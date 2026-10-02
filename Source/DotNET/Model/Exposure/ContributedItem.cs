// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Exposure;

/// <summary>
/// One item an instance added to an exposed collection.
/// </summary>
/// <param name="Id">The stable id of the item, unique across the owner's items and every instance's.</param>
/// <param name="Values">The item's fields.</param>
public record ContributedItem(string Id, IReadOnlyDictionary<string, JsonElement> Values);
