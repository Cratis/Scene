// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Cratis.Scene.Screenplay.Reverse;

internal static partial class SceneJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web) { WriteIndented = false };

    [GeneratedRegex(@"^[A-Za-z_]\w*$", RegexOptions.None, 1000)]
    private static partial Regex IdentifierRegex { get; }

    [GeneratedRegex(@"^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$", RegexOptions.None, 1000)]
    private static partial Regex PathRegex { get; }

    public static JsonObject? Parse(string document)
    {
        try
        {
            return JsonNode.Parse(document) as JsonObject;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public static string? String(JsonNode? node, string property) =>
        Member(node, property) is JsonValue value && value.GetValueKind() == JsonValueKind.String ? value.GetValue<string>() : null;

    public static JsonNode? Member(JsonNode? node, string property) =>
        node is JsonObject json && json.TryGetPropertyValue(property, out var value) ? value : null;

    public static JsonObject? Object(JsonNode? node, string property) => Member(node, property) as JsonObject;

    public static JsonArray Array(JsonNode? node, string property) => Member(node, property) as JsonArray ?? [];

    public static bool Has(JsonNode? node, string property) => Member(node, property) is not null;

    public static bool IsEmpty(JsonNode? node) => node switch
    {
        null => true,
        JsonArray array => array.Count == 0,
        JsonObject json => json.Count == 0,
        _ => false
    };

    public static double? Number(JsonNode? node) =>
        node is JsonValue value && value.GetValueKind() == JsonValueKind.Number
            ? double.Parse(value.ToJsonString(), NumberStyles.Float, CultureInfo.InvariantCulture)
            : null;

    public static int? Integer(JsonNode? node) =>
        Number(node) is { } number && number == Math.Floor(number) && number is >= int.MinValue and <= int.MaxValue ? (int)number : null;

    /// <summary>
    /// An enumeration value is accepted by its name in any casing, or by its position, which is how the two serializations
    /// of the Scene model (the TypeScript editor's string enumerations and the .NET contracts' numbers) write it.
    /// </summary>
    public static int? Index(JsonNode? node, IReadOnlyList<string> names)
    {
        if (node is not JsonValue value)
        {
            return null;
        }

        if (value.GetValueKind() == JsonValueKind.String)
        {
            var text = value.GetValue<string>();
            var index = names.ToList().FindIndex(name => string.Equals(name, text, StringComparison.OrdinalIgnoreCase));
            return index < 0 ? null : index;
        }

        return Integer(value) is { } position && position >= 0 && position < names.Count ? position : null;
    }

    public static IEnumerable<string> UnknownMembers(JsonObject node, IEnumerable<string> known)
    {
        var supported = known.ToHashSet(StringComparer.Ordinal);
        return node.Select(member => member.Key).Where(key => !supported.Contains(key));
    }

    public static bool IsIdentifier(string? value) => value is not null && IdentifierRegex.IsMatch(value);

    public static bool IsPath(string? value) => value is not null && PathRegex.IsMatch(value);

    public static JsonNode? FromNumber(object value) => value switch
    {
        double number => JsonValue.Create(number),
        float number => JsonValue.Create((double)number),
        long number => JsonValue.Create(number),
        int number => JsonValue.Create(number),
        decimal number => JsonValue.Create(number),
        IFormattable formattable => JsonNode.Parse(formattable.ToString(null, CultureInfo.InvariantCulture)),
        _ => JsonValue.Create(value.ToString())
    };
}
