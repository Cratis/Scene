// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Elements;

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// Typed access to a guarded action's open property bag.
/// </summary>
/// <param name="Label">The button label.</param>
/// <param name="Alternatives">The ordered command choices.</param>
/// <param name="Item">The selected-item binding.</param>
/// <param name="Otherwise">The fallback; absent means hidden.</param>
/// <param name="NavigateToScreen">The screen opened after success.</param>
/// <param name="NavigateByParameter">The item field passed to navigation.</param>
public record GuardedActionProperties(
    string Label,
    IReadOnlyList<GuardedActionAlternative> Alternatives,
    BindingExpression? Item = null,
    GuardedActionFallback? Otherwise = null,
    string? NavigateToScreen = null,
    string? NavigateByParameter = null)
{
    /// <summary>
    /// The registered core component name.
    /// </summary>
    public const string ComponentName = "core:guarded-action";

    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    /// <summary>
    /// Reads properties serialized by Stage or constructed in memory.
    /// </summary>
    /// <param name="element">The component carrying the properties.</param>
    /// <returns>The typed properties.</returns>
    public static GuardedActionProperties Read(ExternalComponent element) =>
        JsonSerializer.Deserialize<GuardedActionProperties>(JsonSerializer.Serialize(element.Properties, _options), _options)!;

    /// <summary>
    /// Writes the typed properties into an open property bag.
    /// </summary>
    /// <returns>The component properties.</returns>
    public IReadOnlyDictionary<string, object?> ToProperties() =>
        JsonSerializer.Deserialize<Dictionary<string, object?>>(JsonSerializer.Serialize(this, _options), _options)!;
}
