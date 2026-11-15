// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The meaning of a Scene document with everything that does not change it taken out: members at the editor's defaults,
/// empty collections, data-context binding kinds, enumeration spellings, number formatting, member order, and how anonymous
/// behaviors group their bindings. Two documents that say the same have the same canonical form.
/// </summary>
public static class SceneDocumentCanonicalForm
{
    public const string StudioLayoutName = "StudioScreen";
    const string StudioLayout = StudioLayoutName;

    static readonly HashSet<string> _declarationMembers = [with(StringComparer.Ordinal), "layouts", "screenTemplates", "dialogTemplates"];

    public static string Of(string document) => Of(JsonNode.Parse(document));

    public static string Of(JsonNode? document) => Normalize(document, null)?.ToJsonString(SceneJson.Options) ?? "null";

    public static bool AreEquivalent(string first, string second) => Of(first) == Of(second);

    /// <summary>
    /// The first place two documents differ, as a member path, or null when they say the same.
    /// </summary>
    public static string? FirstDifference(JsonNode? expected, JsonNode? actual) =>
        Difference(Normalize(expected?.DeepClone(), null), Normalize(actual?.DeepClone(), null), "$");

    internal static JsonObject StudioLayoutDeclaration() => StudioLayoutJson();

    static JsonNode? Normalize(JsonNode? node, string? member) => node switch
    {
        JsonObject json => NormalizeObject(json, member),
        JsonArray array => NormalizeArray(array, member),
        JsonValue value => NormalizeValue(value),
        _ => null
    };

    static JsonObject NormalizeObject(JsonObject json, string? owner)
    {
        if (owner is not null && _declarationMembers.Contains(owner))
        {
            json = SceneTemplates.WithRecursiveMarks(json);
        }

        var defaults = SceneElementFrame.Defaults();
        var isBinding = SceneValues.IsBinding(json);
        var result = new JsonObject();
        foreach (var (key, value) in json.OrderBy(entry => entry.Key, StringComparer.Ordinal))
        {
            var normalized = Member(key, value, isBinding, owner);
            if (normalized is null || SceneJson.IsEmpty(normalized) || IsDefault(key, normalized, defaults, isBinding, owner))
            {
                continue;
            }

            result[key] = normalized;
        }

        return result;
    }

    static JsonNode? Member(string key, JsonNode? value, bool isBinding, string? owner) => key switch
    {
        "kind" => Enumeration(value, KindsOf(isBinding, owner)),
        SceneNavigation.Member => Normalize(SceneNavigation.WithoutEmptyModules(SceneNavigationIcons.Normalize(value)), key),
        _ when SceneEnumerations.ByMember.TryGetValue(key, out var names) => Enumeration(value, names),
        _ => Normalize(value?.DeepClone(), key)
    };

    static string[] KindsOf(bool isBinding, string? owner)
    {
        if (isBinding)
        {
            return SceneEnumerations.BindingKinds;
        }

        return owner == "trigger" ? SceneEnumerations.TriggerKinds : SceneEnumerations.ActionKinds;
    }

    static bool IsDefault(string key, JsonNode value, JsonObject defaults, bool isBinding, string? owner) =>
        (isBinding && key == "kind" && value is JsonValue kind && kind.TryGetValue<string>(out var bindingKind) && string.Equals(bindingKind, SceneEnumerations.BindingKinds[0], StringComparison.OrdinalIgnoreCase)) ||
        (owner == "screens" && key == "layout" && value is JsonValue layout && layout.TryGetValue<string>(out var name) && name == StudioLayout) ||
        (defaults[key] is { } @default && JsonNode.DeepEquals(value, Member(key, @default, false, owner)));

    static JsonArray? NormalizeArray(JsonArray array, string? member)
    {
        IEnumerable<JsonNode?> items = array;
        if (member == "behaviors")
        {
            items = array.SelectMany(Ungrouped);
        }
        else if (member == "layouts" && array.Count == 1 && Of(array[0]) == Of(StudioLayoutJson()))
        {
            return null;
        }

        // The levels of outlets are a set: it is which level says what that matters, not the order the editor happened to add them in.
        if (member == SceneOutletLevels.Member)
        {
            items = items.OrderBy(level => $"{SceneJson.String(level, "kind")}/{SceneJson.String(level, "name")}", StringComparer.Ordinal);
        }

        return [.. items.Select(item => Normalize(item?.DeepClone(), member))];
    }

    /// <summary>
    /// An anonymous behavior is nothing but its bindings, so each of them is its own behavior.
    /// </summary>
    static IEnumerable<JsonNode?> Ungrouped(JsonNode? behavior) =>
        behavior is JsonObject json && json["name"] is null && json["order"] is null && json["bindings"] is JsonArray bindings
            ? bindings.Select(binding => (JsonNode?)new JsonObject { ["bindings"] = new JsonArray(binding?.DeepClone()) })
            : [behavior];

    static JsonValue? NormalizeValue(JsonValue value) => value.GetValueKind() switch
    {
        JsonValueKind.Number => JsonValue.Create(SceneJson.Number(value)),
        JsonValueKind.String => JsonValue.Create(value.GetValue<string>()),
        JsonValueKind.True => JsonValue.Create(true),
        JsonValueKind.False => JsonValue.Create(false),
        _ => null
    };

    static JsonNode? Enumeration(JsonNode? value, string[] names) =>
        SceneJson.Index(value, names) is { } index ? JsonValue.Create(names[index].ToLowerInvariant()) : Normalize(value?.DeepClone(), null);

    static JsonObject StudioLayoutJson() =>
        new() { ["name"] = StudioLayout, ["slots"] = new JsonArray(new JsonObject { ["name"] = "content" }) };

    static string? Difference(JsonNode? expected, JsonNode? actual, string path)
    {
        if (expected is JsonObject expectedObject && actual is JsonObject actualObject)
        {
            return expectedObject.Select(entry => entry.Key).Union(actualObject.Select(entry => entry.Key))
                .Select(key => Difference(expectedObject[key], actualObject[key], $"{path}.{key}"))
                .FirstOrDefault(difference => difference is not null);
        }

        if (expected is JsonArray expectedArray && actual is JsonArray actualArray)
        {
            return expectedArray.Count != actualArray.Count
                ? path
                : expectedArray.Select((item, index) => Difference(item, actualArray[index], $"{path}[{index}]")).FirstOrDefault(difference => difference is not null);
        }

        return JsonNode.DeepEquals(expected, actual) ? null : path;
    }
}
