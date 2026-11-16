// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// The effective configuration of one component.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Owner">The layout or template that holds the component.</param>
/// <param name="Properties">The component's properties with the contributions applied.</param>
/// <param name="Values">The effective values of the exposed properties.</param>
public record EffectiveComponentConfiguration(
    string Component,
    string Owner,
    IReadOnlyDictionary<string, JsonElement> Properties,
    IReadOnlyList<EffectivePropertyValue> Values);
