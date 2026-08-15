// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.for_PackageResolver;

public class when_resolving_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, UiProfile Profile, IReadOnlyDictionary<string, IReadOnlyList<string>> Catalog, string RequestedName, ComponentResolution? Expected);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, ComponentResolution? Actual)> _results = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "package-resolution-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _cases = document.RootElement.GetProperty("cases").EnumerateArray().Select(ToFixtureCase).ToList();
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, PackageResolver.Resolve(fixtureCase.RequestedName, fixtureCase.Profile, fixtureCase.Catalog)))];

    [Fact]
    void should_match_the_expected_resolution_for_every_case()
    {
        foreach (var (fixtureCase, actual) in _results)
        {
            (fixtureCase.Name, Flatten(actual)).ShouldEqual((fixtureCase.Name, Flatten(fixtureCase.Expected)));
        }
    }

    static (string Name, string Package, string Shadows)? Flatten(ComponentResolution? resolution) =>
        resolution is null ? null : (resolution.Name, resolution.Package, string.Join(',', resolution.Shadows));

    static FixtureCase ToFixtureCase(JsonElement element)
    {
        var name = element.GetProperty("name").GetString()!;
        var profile = new UiProfile(
            "test",
            "web",
            element.GetProperty("profile").GetProperty("packages").EnumerateArray().Select(value => value.GetString()!).ToList());

        var catalog = element.GetProperty("catalog").EnumerateObject()
            .ToDictionary(
                property => property.Name,
                IReadOnlyList<string> (property) => property.Value.EnumerateArray().Select(value => value.GetString()!).ToList());

        var requestedName = element.GetProperty("requestedName").GetString()!;

        var expectedElement = element.GetProperty("expected");
        var expected = expectedElement.ValueKind == JsonValueKind.Null
            ? null
            : new ComponentResolution(
                expectedElement.GetProperty("name").GetString()!,
                expectedElement.GetProperty("package").GetString()!,
                expectedElement.GetProperty("shadows").EnumerateArray().Select(value => value.GetString()!).ToList());

        return new(name, profile, catalog, requestedName, expected);
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
}
