// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Moves an item within an exposed collection.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Path">The property path.</param>
/// <param name="ItemId">The item.</param>
/// <param name="Index">Where to move it to.</param>
/// <param name="Instance">The instance that contributes; when omitted, the instance of the editing scope.</param>
public record ReorderCollectionItemEdit(
    string Component,
    string Path,
    string ItemId,
    int Index,
    string? Instance = null) : SceneEdit;
