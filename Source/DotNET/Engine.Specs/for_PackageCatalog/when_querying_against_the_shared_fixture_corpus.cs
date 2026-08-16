// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.for_PackageDependencyResolver;
using Cratis.Scene.Engine.Packages;

namespace Cratis.Scene.Engine.for_PackageCatalog;

public class when_querying_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, string Query, IReadOnlyList<string> Selected, IReadOnlyList<string> Expected);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, IReadOnlyList<string> Actual)> _results = null!;

    void Establish()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(PackageFixtures.FixturePath));
        _cases =
        [
            .. document.RootElement.GetProperty("catalogCases").EnumerateArray().Select(element => new FixtureCase(
                element.GetProperty("name").GetString()!,
                element.GetProperty("query").GetString()!,
                element.TryGetProperty("selected", out var selected) ? [.. selected.EnumerateArray().Select(value => value.GetString()!)] : [],
                [.. element.GetProperty("expected").EnumerateArray().Select(value => value.GetString()!)]))
        ];
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, Run(fixtureCase)))];

    [Fact]
    void should_match_the_expected_result_for_every_case()
    {
        foreach (var (fixtureCase, actual) in _results)
        {
            (fixtureCase.Name, string.Join(',', actual)).ShouldEqual((fixtureCase.Name, string.Join(',', fixtureCase.Expected)));
        }
    }

    static IReadOnlyList<string> Run(FixtureCase fixtureCase) => fixtureCase.Query switch
    {
        "baseComponentLibraries" => [.. PackageCatalog.BaseComponentLibraries(PackageFixtures.Catalog).Select(package => package.Name)],
        "availableFor" => [.. PackageCatalog.AvailableFor(PackageFixtures.Catalog, fixtureCase.Selected).Select(package => package.Name)],
        "componentsFor" => PackageCatalog.ComponentsFor(PackageFixtures.Catalog, fixtureCase.Selected),
        _ => throw new NotSupportedException($"The fixture corpus asks for an unknown query '{fixtureCase.Query}'")
    };
}
