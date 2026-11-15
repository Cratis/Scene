// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Sets a property of a node.
/// </summary>
/// <param name="NodeId">The node.</param>
/// <param name="Path">The property path.</param>
/// <param name="Value">The new value.</param>
public record SetPropertyEdit(
    string NodeId,
    string Path,
    JsonElement? Value) : SceneEdit;
