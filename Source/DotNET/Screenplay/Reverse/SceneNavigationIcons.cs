// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Scene draws qualified references. Keep a bare Screenplay spelling beside it so an explicitly qualified
/// Lucide reference is never mistaken for one we qualified. The id matches Editor/IconLibraries/Lucide/lucideManifest.ts.
/// </summary>
static class SceneNavigationIcons
{
    public const string SourceMember = "screenplayIcon";
    const string Lucide = "Cratis.Icons.Lucide";

    public static void Write(JsonObject owner, string? icon)
    {
        SceneValues.Optional(owner, "icon", icon is null ? null : Qualified(icon));
        if (icon?.Contains('#', StringComparison.Ordinal) == false)
        {
            owner[SourceMember] = icon;
        }
    }

    /// <summary>
    /// A designer edit wins over stale source metadata, including an edit to a different Lucide glyph.
    /// </summary>
    public static string? Read(JsonObject owner)
    {
        var icon = SceneJson.String(owner, "icon");
        return SceneJson.String(owner, SourceMember) is { } source && !source.Contains('#', StringComparison.Ordinal) && Qualified(source) == icon
            ? source
            : icon;
    }

    /// <summary>
    /// Old documents can still hold bare icons. Compare them using the same projection as new imports;
    /// stale source spellings have no effect on the current icon or the typed round-trip check.
    /// </summary>
    public static JsonNode? Normalize(JsonNode? navigation)
    {
        var normalized = navigation?.DeepClone();
        NormalizeIcons(normalized);
        return normalized;
    }

    static void NormalizeIcons(JsonNode? node)
    {
        if (node is JsonObject owner)
        {
            if (owner.ContainsKey("icon") || owner.ContainsKey(SourceMember))
            {
                var icon = Read(owner);
                owner.Remove(SourceMember);
                Write(owner, icon);
            }

            foreach (var child in owner.Select(member => member.Value).ToArray())
            {
                NormalizeIcons(child);
            }
        }
        else if (node is JsonArray array)
        {
            foreach (var child in array)
            {
                NormalizeIcons(child);
            }
        }
    }

    static string Qualified(string icon) => icon.Contains('#', StringComparison.Ordinal) ? icon : $"{Lucide}#{icon}";
}
