// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Moves a node.
/// </summary>
/// <param name="NodeId">The node.</param>
/// <param name="Target">The node to move it into.</param>
/// <param name="Slot">The slot, when the target has several.</param>
/// <param name="Index">Where in the list; at the end when omitted.</param>
public record MoveNodeEdit(
    string NodeId,
    string Target,
    string? Slot = null,
    int? Index = null) : SceneEdit;
