// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Starters;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Starters;

namespace Cratis.Scene.Engine.for_StarterThemeValidation;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, UiStarter Starter, Dictionary<string, Theme> Themes, IReadOnlyList<string> ExpectedIncompatible);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, IReadOnlyList<string> Incompatible)> _results = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "ui-starter-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _cases = document.RootElement.GetProperty("themeCases").EnumerateArray().Select(ToFixtureCase).ToList();
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, StarterThemeValidation.IncompatibleThemes(fixtureCase.Starter, fixtureCase.Themes)))];

    [Fact]
    void should_match_the_expected_incompatible_themes_for_every_case()
    {
        foreach (var (fixtureCase, incompatible) in _results)
        {
            (fixtureCase.Name, Flatten(incompatible)).ShouldEqual((fixtureCase.Name, Flatten(fixtureCase.ExpectedIncompatible)));
        }
    }

    static string Flatten(IReadOnlyList<string> themes) => string.Join(',', themes);

    static FixtureCase ToFixtureCase(JsonElement element)
    {
        var name = element.GetProperty("name").GetString()!;

        var starterElement = element.GetProperty("starter");
        var starter = new UiStarter(
            starterElement.GetProperty("name").GetString()!,
            starterElement.GetProperty("packages").EnumerateArray().Select(value => value.GetString()!).ToList(),
            starterElement.GetProperty("themes").EnumerateArray().Select(value => value.GetString()!).ToList(),
            starterElement.GetProperty("gallery").EnumerateArray().Select(value => value.GetString()!).ToList());

        var themes = element.GetProperty("themes").EnumerateObject()
            .ToDictionary(
                property => property.Name,
                property => new Theme(property.Name, property.Value.GetProperty("compatibleWith").EnumerateArray().Select(value => value.GetString()!).ToList()));

        var expectedIncompatible = element.GetProperty("expectedIncompatible").EnumerateArray().Select(value => value.GetString()!).ToList();

        return new(name, starter, themes, expectedIncompatible);
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
