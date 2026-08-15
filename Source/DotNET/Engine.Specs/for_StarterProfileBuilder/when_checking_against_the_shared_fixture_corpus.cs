// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Starters;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Starters;

namespace Cratis.Scene.Engine.for_StarterProfileBuilder;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, UiStarter Starter, string TargetPlatform, UiProfile ExpectedProfile);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, UiProfile Actual)> _results = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "ui-starter-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _cases = document.RootElement.GetProperty("profileCases").EnumerateArray().Select(ToFixtureCase).ToList();
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, StarterProfileBuilder.BuildProfile(fixtureCase.Starter, fixtureCase.TargetPlatform)))];

    [Fact]
    void should_match_the_expected_name_for_every_case()
    {
        foreach (var (fixtureCase, actual) in _results)
        {
            (fixtureCase.Name, actual.Name).ShouldEqual((fixtureCase.Name, fixtureCase.ExpectedProfile.Name));
        }
    }

    [Fact]
    void should_match_the_expected_target_platform_for_every_case()
    {
        foreach (var (fixtureCase, actual) in _results)
        {
            (fixtureCase.Name, actual.TargetPlatform).ShouldEqual((fixtureCase.Name, fixtureCase.ExpectedProfile.TargetPlatform));
        }
    }

    [Fact]
    void should_match_the_expected_packages_for_every_case()
    {
        foreach (var (fixtureCase, actual) in _results)
        {
            (fixtureCase.Name, Flatten(actual.Packages)).ShouldEqual((fixtureCase.Name, Flatten(fixtureCase.ExpectedProfile.Packages)));
        }
    }

    static string Flatten(IReadOnlyList<string> packages) => string.Join(',', packages);

    static FixtureCase ToFixtureCase(JsonElement element)
    {
        var name = element.GetProperty("name").GetString()!;

        var starterElement = element.GetProperty("starter");
        var starter = new UiStarter(
            starterElement.GetProperty("name").GetString()!,
            starterElement.GetProperty("packages").EnumerateArray().Select(value => value.GetString()!).ToList(),
            starterElement.GetProperty("themes").EnumerateArray().Select(value => value.GetString()!).ToList(),
            starterElement.GetProperty("gallery").EnumerateArray().Select(value => value.GetString()!).ToList());

        var targetPlatform = element.GetProperty("targetPlatform").GetString()!;

        var expectedProfileElement = element.GetProperty("expectedProfile");
        var expectedProfile = new UiProfile(
            expectedProfileElement.GetProperty("name").GetString()!,
            expectedProfileElement.GetProperty("targetPlatform").GetString()!,
            expectedProfileElement.GetProperty("packages").EnumerateArray().Select(value => value.GetString()!).ToList());

        return new(name, starter, targetPlatform, expectedProfile);
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
