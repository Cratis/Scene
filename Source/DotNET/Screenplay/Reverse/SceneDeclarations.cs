// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The UI profiles Scene documents name. Screenplay requires every package a component comes from to be listed by a ui
/// profile once there is one, so a profile is widened with the packages the documents' components use, and says so.
/// </summary>
static class SceneDeclarations
{
    static readonly string[] _profileMembers = ["name", "platforms", "defaultSizeClass", "packages", "package", "theme", "layout", "icons"];

    public static (IReadOnlyList<UiProfileSyntax> Profiles, IReadOnlyList<string> Diagnostics) Profiles(IEnumerable<string> documents)
    {
        var gaps = new SceneTransportGaps();
        var roots = documents.Select(SceneJson.Parse).OfType<JsonObject>().ToArray();
        var used = roots.SelectMany(PackagesUsed).Distinct(StringComparer.Ordinal).ToArray();
        var profiles = roots
            .Select(root => SceneJson.Object(root, "uiProfile"))
            .OfType<JsonObject>()
            .Select(profile => Profile(profile, used, gaps))
            .DistinctBy(profile => profile.Name)
            .ToArray();

        return (profiles, gaps.Messages);
    }

    static UiProfileSyntax Profile(JsonObject profile, IReadOnlyList<string> used, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(profile, "UI profile", _profileMembers);
        var packages = Strings(profile, "packages");
        if (SceneJson.String(profile, "package") is { Length: > 0 } package)
        {
            packages = [.. packages, package];
        }

        var name = ScreenplayIdentifier.From(SceneJson.String(profile, "name") ?? "Default");
        var missing = used.Except(packages, StringComparer.Ordinal).ToArray();
        if (missing.Length > 0)
        {
            gaps.Add($"UI profile '{name}' does not list the package{(missing.Length == 1 ? string.Empty : "s")} {string.Join(", ", missing.Select(package => $"'{package}'"))} its screens' components come from; Screenplay requires a ui profile to list them, so the export adds {(missing.Length == 1 ? "it" : "them")}.");
        }

        return new UiProfileSyntax(
            name,
            Strings(profile, "platforms"),
            SceneJson.String(profile, "defaultSizeClass"),
            [.. packages, .. missing],
            SourceLocation.Start,
            SceneJson.String(profile, "theme"),
            SceneJson.String(profile, "layout"))
        {
            Icons = Strings(profile, "icons")
        };
    }

    static IEnumerable<string> PackagesUsed(JsonNode? node) => node switch
    {
        JsonObject json => (SceneJson.String(json, "componentName") is { } component && component.IndexOf(':', StringComparison.Ordinal) is > 0 and var separator
                ? [component[..separator]]
                : Array.Empty<string>())
            .Concat(json.SelectMany(member => PackagesUsed(member.Value))),
        JsonArray array => array.SelectMany(PackagesUsed),
        _ => []
    };

    static IReadOnlyList<string> Strings(JsonObject node, string member) =>
        [.. SceneJson.Array(node, member).OfType<JsonValue>().Where(value => value.TryGetValue<string>(out var text) && !string.IsNullOrWhiteSpace(text)).Select(value => value.GetValue<string>())];
}
