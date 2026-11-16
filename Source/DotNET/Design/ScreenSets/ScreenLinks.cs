// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.ScreenSets;

/// <summary>
/// Finds where the screens of a document navigate to each other.
/// </summary>
public static class ScreenLinks
{
    /// <summary>
    /// Finds every place a screen of the document navigates to another screen, in document order.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <returns>The links.</returns>
    public static IReadOnlyList<ScreenLink> Find(SceneDocument document)
    {
        var links = new List<ScreenLink>();
        foreach (var screen in document.Screens.Select(element => JsonNode.Parse(element.GetRawText())!.AsObject()))
        {
            var elements = new List<JsonObject>();
            Collect(screen["slotContent"], elements);
            foreach (var element in elements)
            {
                foreach (var (prop, value) in element["properties"]!.AsObject())
                {
                    if (value is JsonObject destination && destination["screen"] is JsonValue target && target.TryGetValue<string>(out var to))
                    {
                        links.Add(new ScreenLink(screen["name"]!.GetValue<string>(), element["id"]!.GetValue<string>(), prop, to));
                    }
                }
            }
        }

        return links;
    }

    /// <summary>
    /// Finds the links that go to a screen the set does not have.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <param name="set">The screen set.</param>
    /// <returns>The links.</returns>
    public static IReadOnlyList<ScreenLink> FindDangling(SceneDocument document, ScreenSet set) =>
        [.. Find(document).Where(link => !set.Screens.Contains(link.To))];

    /// <summary>
    /// Finds the screens no other screen of the set navigates to - the entry points, and any screen nothing leads to.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <param name="set">The screen set.</param>
    /// <returns>The screens.</returns>
    public static IReadOnlyList<string> FindUnreached(SceneDocument document, ScreenSet set)
    {
        var targets = Find(document).Where(link => link.From != link.To).Select(link => link.To).ToHashSet();
        return [.. set.Screens.Where(screen => !targets.Contains(screen))];
    }

    static void Collect(JsonNode? node, List<JsonObject> found)
    {
        switch (node)
        {
            case JsonArray array:
                foreach (var item in array)
                {
                    Collect(item, found);
                }

                break;
            case JsonObject record:
                if (record["id"] is JsonValue id && id.TryGetValue<string>(out _) && record["properties"] is JsonObject)
                {
                    found.Add(record);
                }

                foreach (var (_, child) in record)
                {
                    Collect(child, found);
                }

                break;
        }
    }
}
