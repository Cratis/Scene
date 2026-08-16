// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.for_PackageDependencyResolver;
using Cratis.Scene.Engine.Packages;

namespace Cratis.Scene.Engine.for_PackageVersionRange;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Version, string? Range, bool Expected);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, bool Actual)> _results = null!;

    void Establish()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(PackageFixtures.FixturePath));
        _cases =
        [
            .. document.RootElement.GetProperty("versionRangeCases").EnumerateArray().Select(element => new FixtureCase(
                element.GetProperty("version").GetString()!,
                element.GetProperty("range").ValueKind == JsonValueKind.Null ? null : element.GetProperty("range").GetString(),
                element.GetProperty("expected").GetBoolean()))
        ];
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, PackageVersionRange.IsSatisfiedBy(fixtureCase.Version, fixtureCase.Range)))];

    [Fact]
    void should_match_the_expected_outcome_for_every_case()
    {
        foreach (var (fixtureCase, actual) in _results)
        {
            var description = $"{fixtureCase.Version} against '{fixtureCase.Range ?? "<null>"}'";
            (description, actual).ShouldEqual((description, fixtureCase.Expected));
        }
    }
}
