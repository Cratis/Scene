// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Removes a node.
/// </summary>
/// <param name="NodeId">The node.</param>
public record RemoveNodeEdit(
    string NodeId) : SceneEdit;
