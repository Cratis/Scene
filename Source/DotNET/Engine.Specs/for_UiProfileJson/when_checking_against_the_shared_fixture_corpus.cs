// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Profiles;

namespace Cratis.Scene.Engine.for_UiProfileJson;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, string Input, string Canonical);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, string FromText, string FromElement, string Again)> _results = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "ui-profile-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _cases = [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(element => new FixtureCase(
            element.GetProperty("name").GetString()!,
            element.GetProperty("input").GetRawText(),
            element.GetProperty("canonical").GetString()!))];
    }

    void Because() => _results = [.. _cases.Select(fixtureCase =>
    {
        var fromText = UiProfileJson.Serialize(UiProfileJson.Parse(fixtureCase.Input));
        using var inputDocument = JsonDocument.Parse(fixtureCase.Input);
        var fromElement = UiProfileJson.Serialize(UiProfileJson.Parse(inputDocument.RootElement));
        var again = UiProfileJson.Serialize(UiProfileJson.Parse(fixtureCase.Canonical));
        return (fixtureCase, fromText, fromElement, again);
    })];

    [Fact]
    void should_have_cases_in_the_corpus() => _cases.Count.ShouldBeGreaterThan(10);

    [Fact]
    void should_write_the_canonical_bytes_for_every_case()
    {
        foreach (var result in _results)
        {
            (result.Case.Name, result.FromText).ShouldEqual((result.Case.Name, result.Case.Canonical));
        }
    }

    [Fact]
    void should_write_the_same_bytes_when_reading_an_element_for_every_case()
    {
        foreach (var result in _results)
        {
            (result.Case.Name, result.FromElement).ShouldEqual((result.Case.Name, result.Case.Canonical));
        }
    }

    [Fact]
    void should_be_stable_when_the_canonical_form_is_read_and_written_again_for_every_case()
    {
        foreach (var result in _results)
        {
            (result.Case.Name, result.Again).ShouldEqual((result.Case.Name, result.Case.Canonical));
        }
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
