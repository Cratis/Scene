// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Takes a property of a node back to its default.
/// </summary>
/// <param name="NodeId">The node.</param>
/// <param name="Path">The property path.</param>
public record ResetPropertyEdit(
    string NodeId,
    string Path) : SceneEdit;
