// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Reads Scene document JSON tolerantly: a missing or mistyped member is absent, never an exception. The shared helpers every reverse-bridge reader uses, public so a host that assembles its own documents reads them the same way.
/// </summary>
[SuppressMessage("Naming", "CA1720:Identifier contains type name", Justification = "Reading a member as a string, an object or an integer is what these readers are named for; hosts call them by these names.")]
public static partial class SceneJson
{
    /// <summary>
    /// The serializer options a Scene document is written with: web casing, compact.
    /// </summary>
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web) { WriteIndented = false };

    [GeneratedRegex(@"^[A-Za-z_]\w*$", RegexOptions.None, 1000)]
    private static partial Regex IdentifierRegex { get; }

    [GeneratedRegex(@"^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$", RegexOptions.None, 1000)]
    private static partial Regex PathRegex { get; }

    /// <summary>
    /// Parses a document into its root object; null when the text is not a JSON object.
    /// </summary>
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

    /// <summary>
    /// The string value of a member; null when it is missing or not a string.
    /// </summary>
    public static string? String(JsonNode? node, string property) =>
        Member(node, property) is JsonValue value && value.GetValueKind() == JsonValueKind.String ? value.GetValue<string>() : null;

    /// <summary>
    /// The member of a node; null when the node is not an object or has no such member.
    /// </summary>
    public static JsonNode? Member(JsonNode? node, string property) =>
        node is JsonObject json && json.TryGetPropertyValue(property, out var value) ? value : null;

    /// <summary>
    /// The member as an object; null when it is missing or not an object.
    /// </summary>
    public static JsonObject? Object(JsonNode? node, string property) => Member(node, property) as JsonObject;

    /// <summary>
    /// The member as an array; empty when it is missing or not an array.
    /// </summary>
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

    /// <summary>
    /// Whether the value is a Screenplay identifier: a letter or underscore followed by word characters.
    /// </summary>
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
