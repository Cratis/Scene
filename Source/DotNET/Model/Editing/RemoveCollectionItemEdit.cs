// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Removes an item from an exposed collection.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Path">The property path.</param>
/// <param name="ItemId">The item.</param>
/// <param name="Instance">The instance that contributes; when omitted, the instance of the editing scope.</param>
public record RemoveCollectionItemEdit(
    string Component,
    string Path,
    string ItemId,
    string? Instance = null) : SceneEdit;
