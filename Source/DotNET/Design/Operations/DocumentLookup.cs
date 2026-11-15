// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Finds screens, templates, outlets and elements in a Scene document, and makes elements for it. The TypeScript twin is <c language="text">documentLookup</c>.
/// </summary>
internal static partial class DocumentLookup
{
    /// <summary>
    /// Finds the item of a name.
    /// </summary>
    /// <param name="items">The items.</param>
    /// <param name="name">The name.</param>
    /// <returns>The result.</returns>
    public static JsonObject? FindByName(IEnumerable<JsonElement> items, string name) =>
        items.Select(item => JsonNode.Parse(item.GetRawText())!.AsObject()).FirstOrDefault(item => Text(item, "name") == name);

    /// <summary>
    /// Finds the item of a name.
    /// </summary>
    /// <param name="items">The items.</param>
    /// <param name="name">The name.</param>
    /// <returns>The result.</returns>
    public static JsonObject? FindByName(IEnumerable<JsonNode?> items, string name) =>
        items.Select(item => item!.AsObject()).FirstOrDefault(item => Text(item, "name") == name);

    /// <summary>
    /// Reads a string property of a JSON object.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <param name="property">The property.</param>
    /// <returns>The result.</returns>
    public static string? Text(JsonNode? node, string property) =>
        node is JsonObject record && record[property] is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    /// <summary>
    /// Resolves the screen or the screen template an operation applies to.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <param name="screen">The screen.</param>
    /// <param name="template">The template.</param>
    /// <returns>The result.</returns>
    public static ResolvedTarget? ResolveTarget(SceneDocument document, string? screen, string? template)
    {
        if (screen is not null)
        {
            var found = FindByName(document.Screens, screen);
            return found is null ? null : new ResolvedTarget(true, screen, found);
        }

        if (template is not null)
        {
            var found = FindByName(document.ScreenTemplates, template);
            return found is null ? null : new ResolvedTarget(false, template, found);
        }

        return null;
    }

    /// <summary>
    /// Gets the content of a target by outlet.
    /// </summary>
    /// <param name="target">The target.</param>
    /// <returns>The result.</returns>
    public static JsonObject ContentOf(ResolvedTarget target) => (target.Value[target.IsScreen ? "slotContent" : "content"] as JsonObject) ?? [];

    /// <summary>
    /// Gets the outlets a target has: for a screen, the slots of its template; for a template, its own.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <param name="target">The target.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<string> OutletNamesOf(SceneDocument document, ResolvedTarget target)
    {
        if (!target.IsScreen)
        {
            return SlotNames(target.Value["slots"]);
        }

        var templateName = Text(target.Value, "screenTemplate");
        var template = templateName is null ? null : FindByName(document.ScreenTemplates, templateName);
        var slots = template is not null
            ? SlotNames(template["slots"])
            : SlotNames((Text(target.Value, "layout") is { } layoutName ? FindByName(document.Layouts, layoutName) : null)?["slots"]);
        return [.. slots.Concat((target.Value["slotContent"] as JsonObject)?.Select(pair => pair.Key) ?? []).Distinct()];
    }

    /// <summary>
    /// Finds an element anywhere in a target's content.
    /// </summary>
    /// <param name="target">The target.</param>
    /// <param name="id">The id.</param>
    /// <returns>The result.</returns>
    public static PlacedElement? FindElement(ResolvedTarget target, string id)
    {
        foreach (var (outlet, elements) in ContentOf(target))
        {
            foreach (var element in elements?.AsArray() ?? [])
            {
                if (element is JsonObject record && Search(record, outlet, id) is { } found)
                {
                    return found;
                }
            }
        }

        return null;
    }

    /// <summary>
    /// Reads the component an element is.
    /// </summary>
    /// <param name="element">The element.</param>
    /// <returns>The result.</returns>
    public static string ComponentNameOf(JsonObject element) => Text(element, "componentName") ?? string.Empty;

    /// <summary>
    /// Gets every id used anywhere in the document: element ids are unique across all of it.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <returns>The result.</returns>
    public static HashSet<string> IdsInDocument(SceneDocument document)
    {
        var ids = new HashSet<string>(StringComparer.Ordinal);
        CollectIds(JsonSerializer.SerializeToNode(document, SceneJson.Options), ids);
        return ids;
    }

    /// <summary>
    /// Makes an id no part of the document uses: the component's bare name in kebab case and the first free counter. Deterministic.
    /// </summary>
    /// <param name="componentName">The component name.</param>
    /// <param name="taken">The taken.</param>
    /// <returns>The result.</returns>
    public static string NewElementId(string componentName, ISet<string> taken)
    {
        var stem = Kebab(componentName[(componentName.LastIndexOf(':') + 1)..]);
        for (var counter = 1; ; counter++)
        {
            var id = $"{stem}-{counter}";
            if (!taken.Contains(id))
            {
                return id;
            }
        }
    }

    /// <summary>
    /// Makes a Scene component element with the defaults every element carries.
    /// </summary>
    /// <param name="id">The id.</param>
    /// <param name="componentName">The component name.</param>
    /// <param name="properties)">The properties).</param>
    /// <returns>The result.</returns>
    public static JsonObject CreateComponentElement(string id, string componentName, JsonObject properties) => new()
    {
        ["id"] = id,
        ["name"] = id,
        ["componentName"] = componentName,
        ["properties"] = properties,
        ["slots"] = new JsonObject(),
        ["visibility"] = "Visible",
        ["isEnabled"] = true,
        ["opacity"] = 1,
        ["size"] = new JsonObject(),
        ["zIndex"] = 0,
        ["minimumSize"] = new JsonObject(),
        ["maximumSize"] = new JsonObject(),
        ["margin"] = new JsonObject { ["left"] = 0, ["top"] = 0, ["right"] = 0, ["bottom"] = 0 },
        ["horizontalAlignment"] = "Stretch",
        ["verticalAlignment"] = "Stretch",
    };

    /// <summary>
    /// Reads the names of the slots in a JSON array.
    /// </summary>
    /// <param name="slots">The slots.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<string> SlotNames(JsonNode? slots) =>
        [.. (slots as JsonArray ?? []).Select(slot => Text(slot, "name")).OfType<string>()];

    [GeneratedRegex("[A-Z]", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Capitals();

    [GeneratedRegex("[^a-z0-9-]", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Others();

    static string Kebab(string name)
    {
        var dashed = Capitals().Replace(name, match => $"-{match.Value.ToLowerInvariant()}");
        if (dashed.StartsWith('-'))
        {
            dashed = dashed[1..];
        }

        return Others().Replace(dashed, "-");
    }

    static IEnumerable<JsonObject> Children(JsonObject element)
    {
        static IEnumerable<JsonObject> Take(JsonNode? value) =>
            value is JsonObject record && record["id"] is JsonValue id && id.TryGetValue<string>(out _) ? [record] : [];

        foreach (var child in element["children"] is JsonArray children ? children.SelectMany(Take) : [])
        {
            yield return child;
        }

        if (element["slots"] is JsonObject slots)
        {
            foreach (var (_, list) in slots)
            {
                foreach (var child in list is JsonArray items ? items.SelectMany(Take) : [])
                {
                    yield return child;
                }
            }
        }

        foreach (var child in Take(element["content"]))
        {
            yield return child;
        }

        foreach (var child in Take(element["itemTemplate"]))
        {
            yield return child;
        }
    }

    static PlacedElement? Search(JsonObject element, string outlet, string id)
    {
        if (Text(element, "id") == id)
        {
            return new PlacedElement(element, outlet);
        }

        foreach (var child in Children(element))
        {
            if (Search(child, outlet, id) is { } found)
            {
                return found;
            }
        }

        return null;
    }

    static void CollectIds(JsonNode? node, HashSet<string> ids)
    {
        switch (node)
        {
            case JsonArray array:
                foreach (var item in array)
                {
                    CollectIds(item, ids);
                }

                break;
            case JsonObject record:
                if (Text(record, "id") is { } id)
                {
                    ids.Add(id);
                }

                foreach (var (_, child) in record)
                {
                    CollectIds(child, ids);
                }

                break;
        }
    }
}
