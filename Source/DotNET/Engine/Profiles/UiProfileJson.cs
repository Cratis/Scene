// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Reads and writes a <see cref="UiProfile"/> as JSON in its one canonical form, shared byte for byte with the TypeScript
/// engine (<c language="csharp">parseUiProfile</c>/<c language="csharp">serializeUiProfile</c>) through the shared <c language="csharp">ui-profile-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// <para>
/// Readers are lenient: property names and enum values are matched case-insensitively, unknown properties are ignored and any
/// member may be absent, so documents written before <see cref="UiProfile.Root"/>, <see cref="UiProfile.Appearance"/> and
/// <see cref="UiProfile.Defaults"/> and <see cref="UiProfile.Identity"/> existed load unchanged. Writers are strict: camelCase names, enum values by their declared
/// name, absent members omitted, no whitespace.
/// </para>
/// <para>
/// Canonical key order is the model's declaration order for the profile, its root template, its template references, its
/// appearance, its defaults, its identity and its logo; every other object (the sample-data selection, the shell's options) has its keys ordered by
/// ordinal comparison. Arrays keep their order.
/// </para>
/// </remarks>
public static class UiProfileJson
{
    static readonly string[] _profileOrder = ["name", "targetPlatform", "packages", "defaultSizeClass", "layout", "theme", "sampleData", "root", "appearance", "defaults", "identity"];
    static readonly string[] _referenceOrder = ["source", "id", "blueprint", "version"];

    static readonly Dictionary<string, string[]> _orderByPath = new(StringComparer.Ordinal)
    {
        [string.Empty] = _profileOrder,
        ["root"] = ["template", "options"],
        ["root.template"] = _referenceOrder,
        ["appearance"] = ["colorScheme", "accent", "corners", "font"],
        ["identity"] = ["name", "logo", "showName"],
        ["identity.logo"] = ["kind", "initials", "icon", "image"],
        ["defaults"] = ["newScreenTemplate"],
        ["defaults.newScreenTemplate"] = _referenceOrder,
    };

    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        Converters = { new JsonStringEnumConverter() },
    };

    /// <summary>
    /// Reads a profile from JSON.
    /// </summary>
    /// <param name="json">The JSON text of a profile.</param>
    /// <returns>The profile.</returns>
    /// <exception cref="JsonException">The text is not a valid profile.</exception>
    public static UiProfile Parse(string json) =>
        JsonSerializer.Deserialize<UiProfile>(json, _options) ?? throw new JsonException("A UI profile cannot be JSON null.");

    /// <summary>
    /// Reads a profile from a JSON element.
    /// </summary>
    /// <param name="element">The element holding a profile.</param>
    /// <returns>The profile.</returns>
    /// <exception cref="JsonException">The element is not a valid profile.</exception>
    public static UiProfile Parse(JsonElement element) =>
        element.Deserialize<UiProfile>(_options) ?? throw new JsonException("A UI profile cannot be JSON null.");

    /// <summary>
    /// Writes a profile as canonical JSON.
    /// </summary>
    /// <param name="profile">The profile to write.</param>
    /// <returns>The canonical JSON text.</returns>
    public static string Serialize(UiProfile profile)
    {
        var node = JsonSerializer.SerializeToNode(profile, _options)!;
        return Canonicalize(node, string.Empty)!.ToJsonString(_options);
    }

    static JsonNode? Canonicalize(JsonNode? node, string path)
    {
        switch (node)
        {
            case JsonObject jsonObject:
                var keys = jsonObject.Select(_ => _.Key).ToList();
                var ordered = _orderByPath.TryGetValue(path, out var order)
                    ? order.Where(keys.Contains).Concat(keys.Except(order).Order(StringComparer.Ordinal))
                    : keys.Order(StringComparer.Ordinal);

                var result = new JsonObject();
                foreach (var key in ordered)
                {
                    var child = jsonObject[key];
                    jsonObject.Remove(key);
                    result.Add(key, Canonicalize(child, path.Length == 0 ? key : $"{path}.{key}"));
                }

                return result;

            case JsonArray jsonArray:
                var items = jsonArray.ToList();
                jsonArray.Clear();
                var array = new JsonArray();
                foreach (var item in items)
                {
                    array.Add(Canonicalize(item, $"{path}[]"));
                }

                return array;

            default:
                return node;
        }
    }
}
