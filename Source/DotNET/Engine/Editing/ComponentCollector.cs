// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Finds the components inside a layout, template or screen the way the editing engine does: by scanning for the shape of one
/// rather than following a fixed list of properties, so a component is found wherever the model keeps it. The first copy of a
/// component that a freeform arrangement repeats is the one returned.
/// </summary>
static class ComponentCollector
{
    /// <summary>
    /// Finds every component inside an owner, each once by id.
    /// </summary>
    /// <param name="owner">The layout, template, dialog template or screen.</param>
    /// <returns>The components by id.</returns>
    public static IReadOnlyDictionary<string, JsonElement> Collect(JsonElement owner)
    {
        var found = new Dictionary<string, JsonElement>(StringComparer.Ordinal);
        Visit(owner, found);
        return found;
    }

    static void Visit(JsonElement value, Dictionary<string, JsonElement> found)
    {
        switch (value.ValueKind)
        {
            case JsonValueKind.Array:
                foreach (var item in value.EnumerateArray())
                {
                    Visit(item, found);
                }

                break;

            case JsonValueKind.Object:
                if (IsComponent(value, out var id))
                {
                    found.TryAdd(id, value);
                }

                foreach (var property in value.EnumerateObject())
                {
                    Visit(property.Value, found);
                }

                break;
        }
    }

    static bool IsComponent(JsonElement value, out string id)
    {
        id = JsonData.String(value, "id") ?? string.Empty;
        return id.Length > 0
            && JsonData.String(value, "componentName") is not null
            && value.TryGetProperty("properties", out var properties)
            && properties.ValueKind == JsonValueKind.Object;
    }
}
