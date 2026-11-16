// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Finds the components in a layout, template, dialog template or screen.
/// </summary>
static class ComponentWalker
{
    /// <summary>
    /// Collects every component of an owner, by id, the first one winning, in the order they are found.
    /// </summary>
    /// <param name="owner">The owner.</param>
    /// <returns>The components.</returns>
    public static IReadOnlyList<JsonObject> Collect(JsonNode? owner)
    {
        var found = new List<JsonObject>();
        var ids = new HashSet<string>(StringComparer.Ordinal);
        Visit(owner, found, ids);
        return found;
    }

    static void Visit(JsonNode? value, List<JsonObject> found, HashSet<string> ids)
    {
        switch (value)
        {
            case JsonArray list:
                foreach (var item in list)
                {
                    Visit(item, found, ids);
                }

                break;

            case JsonObject owner:
                if (IsComponent(owner) && ids.Add(Data.Text(owner, "id")!))
                {
                    found.Add(owner);
                }

                foreach (var (_, child) in owner)
                {
                    Visit(child, found, ids);
                }

                break;
        }
    }

    static bool IsComponent(JsonObject value) =>
        Data.Text(value, "id") is not null && Data.Text(value, "componentName") is not null && Data.Get(value, "properties") is JsonObject or JsonArray;
}
