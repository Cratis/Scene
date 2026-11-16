// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Stops exposing a property.
/// </summary>
/// <param name="Owner">The layout or template.</param>
/// <param name="Component">The id of the component.</param>
/// <param name="Path">The property path.</param>
public record UnexposePropertyEdit(
    string Owner,
    string Component,
    string Path) : SceneEdit;
