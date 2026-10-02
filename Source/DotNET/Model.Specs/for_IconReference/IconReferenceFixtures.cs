// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Icons;

namespace Cratis.Scene.Model.for_IconReference;

public static class IconReferenceFixtures
{
    public static JsonElement Load(string section)
    {
        var path = Path.Combine(FindRepositoryRoot(), "icon-reference-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(path));
        return document.RootElement.GetProperty(section).Clone();
    }

    public static IconReference ToReference(JsonElement element) =>
        new(
            element.GetProperty("library").GetString()!,
            element.GetProperty("key").GetString()!,
            element.TryGetProperty("variant", out var variant) ? variant.GetString() : null);

    static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new DirectoryNotFoundException("Could not locate the repository root (Scene.slnx) above " + AppContext.BaseDirectory);
    }
}
