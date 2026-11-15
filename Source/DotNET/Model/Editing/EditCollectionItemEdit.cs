// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Changes one field of an item of an exposed collection.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Path">The property path.</param>
/// <param name="ItemId">The item.</param>
/// <param name="Field">The field.</param>
/// <param name="Value">The new value.</param>
/// <param name="Instance">The instance that contributes; when omitted, the instance of the editing scope.</param>
public record EditCollectionItemEdit(
    string Component,
    string Path,
    string ItemId,
    string Field,
    JsonElement? Value,
    string? Instance = null) : SceneEdit;
