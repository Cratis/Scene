// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.for_PackageDependencyResolver;

/// <summary>
/// Reads the catalog out of <c>package-dependency-fixtures.json</c> - the same file the TypeScript specs
/// read, so both languages resolve against an identical set of packages rather than two hand-written
/// ones that can quietly diverge.
/// </summary>
public static class PackageFixtures
{
    static readonly Lazy<IReadOnlyList<ScenePackage>> _catalog = new(Load);

    /// <summary>
    /// Gets the shared fixture catalog.
    /// </summary>
    public static IReadOnlyList<ScenePackage> Catalog => _catalog.Value;

    /// <summary>
    /// Gets the path of the shared fixture file, so a spec reading a different section of the same corpus
    /// does not have to find the repository root for itself.
    /// </summary>
    public static string FixturePath => Path.Combine(FindRepositoryRoot(), "package-dependency-fixtures.json");

    static IReadOnlyList<ScenePackage> Load()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(FixturePath));
        return [.. document.RootElement.GetProperty("catalog").EnumerateArray().Select(ToPackage)];
    }

    static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new DirectoryNotFoundException("Could not locate the repository root (Scene.slnx) above " + AppContext.BaseDirectory);
    }

    static ScenePackage ToPackage(JsonElement element) =>
        new(
            element.GetProperty("name").GetString()!,
            element.GetProperty("version").GetString()!,
            Enum.Parse<PackageKind>(element.GetProperty("kind").GetString()!),
            [.. element.GetProperty("dependencies").EnumerateArray().Select(ToDependency)],
            Strings(element, "components"),
            Strings(element, "layouts"),
            Strings(element, "screenTemplates"),
            Strings(element, "dialogTemplates"),
            Strings(element, "themes"));

    static PackageDependency ToDependency(JsonElement element) =>
        new(
            element.GetProperty("name").GetString()!,
            element.TryGetProperty("versionRange", out var range) ? range.GetString() : null);

    static IReadOnlyList<string> Strings(JsonElement element, string property) =>
        [.. element.GetProperty(property).EnumerateArray().Select(value => value.GetString()!)];
}
