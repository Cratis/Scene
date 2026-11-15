// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// One allowed value of an enumerated property.
/// </summary>
/// <param name="Value">The value, a string or a number.</param>
/// <param name="Label">What the author sees.</param>
/// <param name="Description">What the choice means.</param>
public record PropertyChoice(
    JsonElement Value,
    string Label,
    string? Description = null);
