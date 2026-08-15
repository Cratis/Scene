// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.for_ThemeCompatibility;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, Theme Theme, UiProfile Profile, IReadOnlyList<string> ExpectedIncompatible, IReadOnlyList<string> ExpectedApplicable);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, IReadOnlyList<string> Incompatible, IReadOnlyList<string> Applicable)> _results = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "theme-compatibility-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _cases = document.RootElement.GetProperty("cases").EnumerateArray().Select(ToFixtureCase).ToList();
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (
        fixtureCase,
        ThemeCompatibility.IncompatiblePackages(fixtureCase.Theme, fixtureCase.Profile),
        ThemeCompatibility.ApplicablePackages(fixtureCase.Theme, fixtureCase.Profile)))];

    [Fact]
    void should_match_the_expected_incompatible_packages_for_every_case()
    {
        foreach (var (fixtureCase, incompatible, _) in _results)
        {
            (fixtureCase.Name, Flatten(incompatible)).ShouldEqual((fixtureCase.Name, Flatten(fixtureCase.ExpectedIncompatible)));
        }
    }

    [Fact]
    void should_match_the_expected_applicable_packages_for_every_case()
    {
        foreach (var (fixtureCase, _, applicable) in _results)
        {
            (fixtureCase.Name, Flatten(applicable)).ShouldEqual((fixtureCase.Name, Flatten(fixtureCase.ExpectedApplicable)));
        }
    }

    static string Flatten(IReadOnlyList<string> packages) => string.Join(',', packages);

    static FixtureCase ToFixtureCase(JsonElement element)
    {
        var name = element.GetProperty("name").GetString()!;

        var theme = new Theme(
            "test-theme",
            element.GetProperty("theme").GetProperty("compatibleWith").EnumerateArray().Select(value => value.GetString()!).ToList());

        var profile = new UiProfile(
            "test-profile",
            "web",
            element.GetProperty("profile").GetProperty("packages").EnumerateArray().Select(value => value.GetString()!).ToList());

        var expectedIncompatible = element.GetProperty("expectedIncompatible").EnumerateArray().Select(value => value.GetString()!).ToList();
        var expectedApplicable = element.GetProperty("expectedApplicable").EnumerateArray().Select(value => value.GetString()!).ToList();

        return new(name, theme, profile, expectedIncompatible, expectedApplicable);
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
