// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// Describes one layout type.
/// </summary>
/// <param name="Type">The layout type.</param>
/// <param name="Label">What the author sees.</param>
/// <param name="Capabilities">What it can do.</param>
/// <param name="Properties">Its properties.</param>
/// <param name="Description">What it is for.</param>
public record LayoutTypeDescriptor(
    LayoutType Type,
    string Label,
    LayoutCapabilities Capabilities,
    IReadOnlyList<PropertyDescriptor> Properties,
    string? Description = null);
