// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Sets the value an instance contributes to an exposed property.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Path">The property path.</param>
/// <param name="Value">The value.</param>
/// <param name="Instance">The instance that contributes; when omitted, the instance of the editing scope.</param>
public record SetInstanceValueEdit(
    string Component,
    string Path,
    JsonElement? Value,
    string? Instance = null) : SceneEdit;
