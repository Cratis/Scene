// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Adds an item to an exposed collection.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Path">The property path.</param>
/// <param name="Item">The item.</param>
/// <param name="Instance">The instance that contributes; when omitted, the instance of the editing scope.</param>
/// <param name="Index">Where in the collection; at the end when omitted.</param>
public record AddCollectionItemEdit(
    string Component,
    string Path,
    ContributedItem Item,
    string? Instance = null,
    int? Index = null) : SceneEdit;
