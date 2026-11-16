// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Lets what sits inside a layout or template configure one of its properties.
/// </summary>
/// <param name="Owner">The layout or template.</param>
/// <param name="Property">What to expose.</param>
public record ExposePropertyEdit(
    string Owner,
    ExposedProperty Property) : SceneEdit;
