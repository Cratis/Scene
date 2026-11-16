// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Inserts a node into a slot or a container.
/// </summary>
/// <param name="Target">The node to insert into.</param>
/// <param name="Slot">The slot, when the target has several.</param>
/// <param name="Index">Where in the list; at the end when omitted.</param>
/// <param name="Element">The element to insert.</param>
/// <param name="FlowNode">The flow node to insert.</param>
public record InsertNodeEdit(
    string Target,
    string? Slot = null,
    int? Index = null,
    JsonElement? Element = null,
    JsonElement? FlowNode = null) : SceneEdit;
