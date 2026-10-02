// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Structural comparison and reading of the JSON a document is made of. A document is compared as data, never as
/// text, so key order and number formatting are not differences.
/// </summary>
static class JsonData
{
    /// <summary>
    /// Whether two optional values are the same data, or both absent.
    /// </summary>
    /// <param name="left">The first value.</param>
    /// <param name="right">The second value.</param>
    /// <returns><see langword="true"/> when they are equal; otherwise <see langword="false"/>.</returns>
    public static bool DeepEquals(JsonElement? left, JsonElement? right) =>
        left is null || right is null ? left is null && right is null : DeepEquals(left.Value, right.Value);

    /// <summary>
    /// Whether two values are the same data.
    /// </summary>
    /// <param name="left">The first value.</param>
    /// <param name="right">The second value.</param>
    /// <returns><see langword="true"/> when they are equal; otherwise <see langword="false"/>.</returns>
    public static bool DeepEquals(JsonElement left, JsonElement right)
    {
        if (left.ValueKind is JsonValueKind.True or JsonValueKind.False)
        {
            return left.ValueKind == right.ValueKind;
        }

        if (left.ValueKind != right.ValueKind)
        {
            return false;
        }

        return left.ValueKind switch
        {
            JsonValueKind.Object => ObjectsEqual(left, right),
            JsonValueKind.Array => ArraysEqual(left, right),
            JsonValueKind.String => string.Equals(left.GetString(), right.GetString(), StringComparison.Ordinal),
            JsonValueKind.Number => NumbersEqual(left, right),
            _ => true
        };
    }

    /// <summary>
    /// Reads a string property.
    /// </summary>
    /// <param name="element">The object.</param>
    /// <param name="property">The name of the property.</param>
    /// <returns>The string, or <see langword="null"/> when there is no such string property.</returns>
    public static string? String(JsonElement element, string property) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    /// <summary>
    /// Reads the items of an array property.
    /// </summary>
    /// <param name="element">The object.</param>
    /// <param name="property">The name of the property.</param>
    /// <returns>The items; none when there is no such array property.</returns>
    public static IEnumerable<JsonElement> Array(JsonElement element, string property) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.Array
            ? value.EnumerateArray()
            : [];

    /// <summary>
    /// Reads the value at a dotted path, where <c language="csharp">a.b</c> reads <c language="csharp">bag.a.b</c>.
    /// </summary>
    /// <param name="bag">The object.</param>
    /// <param name="path">The dotted path.</param>
    /// <returns>The value, or <see langword="null"/> when a step is missing.</returns>
    public static JsonElement? Path(JsonElement bag, string path)
    {
        var current = bag;
        foreach (var key in path.Split('.'))
        {
            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(key, out current))
            {
                return null;
            }
        }

        return current;
    }

    static bool NumbersEqual(JsonElement left, JsonElement right) =>
        left.TryGetDecimal(out var leftDecimal) && right.TryGetDecimal(out var rightDecimal)
            ? leftDecimal == rightDecimal
            : left.GetDouble() == right.GetDouble();

    static bool ArraysEqual(JsonElement left, JsonElement right)
    {
        if (left.GetArrayLength() != right.GetArrayLength())
        {
            return false;
        }

        return left.EnumerateArray().Zip(right.EnumerateArray()).All(pair => DeepEquals(pair.First, pair.Second));
    }

    static bool ObjectsEqual(JsonElement left, JsonElement right)
    {
        var leftProperties = left.EnumerateObject().ToList();
        if (leftProperties.Count != right.EnumerateObject().Count())
        {
            return false;
        }

        return leftProperties.TrueForAll(property => right.TryGetProperty(property.Name, out var other) && DeepEquals(property.Value, other));
    }
}
