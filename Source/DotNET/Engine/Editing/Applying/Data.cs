// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Reads and changes the plain JSON a Scene document is held as while an edit is applied, the way the TypeScript engine reads and
/// changes the plain objects it holds the document as.
/// </summary>
static class Data
{
    /// <summary>
    /// Gets the value at a document path.
    /// </summary>
    /// <param name="root">The document, or a part of it.</param>
    /// <param name="path">The path.</param>
    /// <returns>The value, or <see langword="null"/> when any step is missing.</returns>
    public static JsonNode? At(JsonNode? root, DocumentPath path)
    {
        var current = root;
        foreach (var key in path)
        {
            current = Step(current, key);
            if (current is null)
            {
                return null;
            }
        }

        return current;
    }

    /// <summary>
    /// Gets the array at a path, creating it - and any objects on the way - when it is not there yet. Changes the document, which
    /// callers hold a copy of.
    /// </summary>
    /// <param name="root">The document.</param>
    /// <param name="path">The path.</param>
    /// <returns>The array.</returns>
    public static JsonArray EnsureArrayAt(JsonNode root, DocumentPath path)
    {
        var current = root;
        for (var position = 0; position < path.Count; position++)
        {
            var key = path[position];
            var next = Step(current, key);
            if (next is null)
            {
                next = position == path.Count - 1 ? new JsonArray() : new JsonObject();
                if (key is string name && current is JsonObject owner)
                {
                    owner[name] = next;
                }
                else if (key is int index && current is JsonArray list)
                {
                    list[index] = next;
                }
            }

            current = next;
        }

        return (JsonArray)current;
    }

    /// <summary>
    /// Gets the paths a change to a path must be made at: the path itself and, for a node inside a freeform element, the same place
    /// in every other size-class variant's copy.
    /// </summary>
    /// <param name="mirror">The mirror of the node, when it has one.</param>
    /// <param name="path">The path of the change.</param>
    /// <returns>The paths.</returns>
    public static IReadOnlyList<DocumentPath> MirroredPaths(Mirror? mirror, DocumentPath path)
    {
        if (mirror is null || !path.StartsWith(mirror.Prefix))
        {
            return [path];
        }

        return [path, .. mirror.Others.Select(other => new DocumentPath([.. other, .. path.Slice(mirror.Prefix.Count)]))];
    }

    /// <summary>
    /// Gets whether an object has a member, even one set to <c language="json">null</c>.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <param name="name">The member name.</param>
    /// <returns><see langword="true"/> when the node is an object with that member.</returns>
    public static bool Has(JsonNode? node, string name) => node is JsonObject owner && owner.ContainsKey(name);

    /// <summary>
    /// Gets a member of an object.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <param name="name">The member name.</param>
    /// <returns>The member, or <see langword="null"/> when the node is no object or has no such member.</returns>
    public static JsonNode? Get(JsonNode? node, string name) => node is JsonObject owner && owner.TryGetPropertyValue(name, out var value) ? value : null;

    /// <summary>
    /// Gets a text member of an object.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <param name="name">The member name.</param>
    /// <returns>The text, or <see langword="null"/> when the member is missing or not text.</returns>
    public static string? Text(JsonNode? node, string name) => Get(node, name) is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    /// <summary>
    /// Gets an array member of an object.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <param name="name">The member name.</param>
    /// <returns>The array, or an empty one when the member is missing or not an array.</returns>
    public static IReadOnlyList<JsonNode?> List(JsonNode? node, string name) => Get(node, name) is JsonArray list ? [.. list] : [];

    /// <summary>
    /// Gets the text of a JSON string value.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <returns>The text, or <see langword="null"/> when the node is not a string.</returns>
    public static string? AsText(JsonNode? node) => node is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    /// <summary>
    /// Gets whether a JSON value is a number.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <param name="number">The number.</param>
    /// <returns><see langword="true"/> when the node is a finite number.</returns>
    public static bool TryNumber(JsonNode? node, out double number)
    {
        number = 0;
        if (node is JsonValue value && value.GetValueKind() == JsonValueKind.Number && value.TryGetValue(out double parsed) && double.IsFinite(parsed))
        {
            number = parsed;
            return true;
        }

        return false;
    }

    /// <summary>
    /// Gets whether a JSON value is a boolean and which.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <param name="flag">The value.</param>
    /// <returns><see langword="true"/> when the node is a boolean.</returns>
    public static bool TryBoolean(JsonNode? node, out bool flag)
    {
        flag = false;
        if (node is JsonValue value && value.TryGetValue(out bool parsed))
        {
            flag = parsed;
            return true;
        }

        return false;
    }

    /// <summary>
    /// Formats a number the way JavaScript does in a template string.
    /// </summary>
    /// <param name="number">The number.</param>
    /// <returns>The text.</returns>
    public static string Format(double number) => number.ToString("R", CultureInfo.InvariantCulture);

    /// <summary>
    /// Reads a JSON element into a node the engine can change.
    /// </summary>
    /// <param name="element">The element, or <see langword="null"/> when there is none.</param>
    /// <returns>A node of its own, or <see langword="null"/> for none and for JSON <c language="json">null</c>.</returns>
    public static JsonNode? FromElement(JsonElement? element) => element is { } value && value.ValueKind != JsonValueKind.Null && value.ValueKind != JsonValueKind.Undefined ? JsonNode.Parse(value.GetRawText()) : null;

    /// <summary>
    /// Reads a node into a JSON element that shares nothing with it.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <returns>The element, or <see langword="null"/> for no node.</returns>
    public static JsonElement? ToElement(JsonNode? node) => node is null ? null : JsonSerializer.SerializeToElement(node);

    /// <summary>
    /// Reads a node into a JSON element that shares nothing with it.
    /// </summary>
    /// <param name="node">The node, which is JSON <c language="json">null</c> when it is <see langword="null"/>.</param>
    /// <returns>The element.</returns>
    public static JsonElement ToElementOrNull(JsonNode? node) => JsonSerializer.SerializeToElement(node);

    /// <summary>
    /// Copies a node so that it shares nothing with the original.
    /// </summary>
    /// <param name="node">The node.</param>
    /// <returns>The copy.</returns>
    public static JsonNode? Clone(JsonNode? node) => node?.DeepClone();

    /// <summary>
    /// Gets whether two values are structurally equal.
    /// </summary>
    /// <param name="left">The first value.</param>
    /// <param name="right">The second value.</param>
    /// <returns><see langword="true"/> when they are equal.</returns>
    public static bool Equal(JsonNode? left, JsonNode? right) => JsonNode.DeepEquals(left, right);

    /// <summary>
    /// Gets a value at a dotted path in a plain object: <c language="text">a.b.c</c> reads <c language="text">bag.a.b.c</c>.
    /// </summary>
    /// <param name="bag">The object.</param>
    /// <param name="path">The dotted path.</param>
    /// <param name="value">The value, which is <see langword="null"/> for a JSON <c language="json">null</c> too.</param>
    /// <returns><see langword="true"/> when every step is there.</returns>
    public static bool TryGetValueAtPath(JsonObject bag, string path, out JsonNode? value)
    {
        JsonNode? current = bag;
        foreach (var key in path.Split('.'))
        {
            if (current is not JsonObject owner || !owner.TryGetPropertyValue(key, out current))
            {
                value = null;
                return false;
            }
        }

        value = current;
        return true;
    }

    /// <summary>
    /// Gets the value at a dotted path, or <see langword="null"/> when a step is missing.
    /// </summary>
    /// <param name="bag">The object.</param>
    /// <param name="path">The dotted path.</param>
    /// <returns>The value.</returns>
    public static JsonNode? GetValueAtPath(JsonObject bag, string path) => TryGetValueAtPath(bag, path, out var value) ? value : null;

    /// <summary>
    /// Sets a value at a dotted path, creating intermediate objects. Changes the bag, which callers hold a copy of.
    /// </summary>
    /// <param name="bag">The object.</param>
    /// <param name="path">The dotted path.</param>
    /// <param name="value">The value, which the bag takes over.</param>
    public static void SetValueAtPath(JsonObject bag, string path, JsonNode? value)
    {
        var keys = path.Split('.');
        var current = bag;
        foreach (var key in keys.Take(keys.Length - 1))
        {
            if (!current.TryGetPropertyValue(key, out var next) || next is not JsonObject)
            {
                current[key] = new JsonObject();
            }

            current = (JsonObject)current[key]!;
        }

        current[keys[^1]] = value;
    }

    /// <summary>
    /// Removes the value at a dotted path, leaving intermediate objects in place. Changes the bag.
    /// </summary>
    /// <param name="bag">The object.</param>
    /// <param name="path">The dotted path.</param>
    public static void RemoveValueAtPath(JsonObject bag, string path)
    {
        var keys = path.Split('.');
        JsonNode? current = bag;
        foreach (var key in keys.Take(keys.Length - 1))
        {
            if (current is not JsonObject owner || !owner.TryGetPropertyValue(key, out current))
            {
                return;
            }
        }

        if (current is JsonObject target)
        {
            target.Remove(keys[^1]);
        }
    }

    static JsonNode? Step(JsonNode? current, object key) => key switch
    {
        string name when current is JsonObject owner => owner.TryGetPropertyValue(name, out var value) ? value : null,
        int index when current is JsonArray list => index >= 0 && index < list.Count ? list[index] : null,
        _ => null
    };
}
