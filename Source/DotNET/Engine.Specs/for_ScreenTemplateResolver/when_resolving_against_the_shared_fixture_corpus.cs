// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_ScreenTemplateResolver;

public class when_resolving_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(
        string Name,
        Layout Layout,
        IReadOnlyList<ScreenTemplate> Templates,
        IReadOnlyList<string> ExpectedPlacements,
        IReadOnlyList<string> ExpectedUnplaced,
        IReadOnlyList<string> ExpectedCycles);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, ScreenTemplateResolution Resolution)> _results = null!;

    void Establish()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), "screen-template-fixtures.json")));
        _cases = [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(ToFixtureCase)];
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, ScreenTemplateResolver.Resolve(fixtureCase.Layout, fixtureCase.Templates)))];

    [Fact]
    void should_place_every_template_where_the_corpus_expects() =>
        AssertEach(
            resolution => [.. resolution.Placements.Select(placement => $"{placement.Template}@{placement.Slot}->{placement.Container}#{placement.Depth}")],
            fixtureCase => fixtureCase.ExpectedPlacements);

    [Fact]
    void should_report_the_expected_unplaced_templates() =>
        AssertEach(
            resolution => [.. resolution.Unplaced.Select(unplaced => $"{unplaced.Template}@{unplaced.Slot}?{string.Join('|', unplaced.Candidates)}")],
            fixtureCase => fixtureCase.ExpectedUnplaced);

    [Fact]
    void should_report_the_expected_cycles() =>
        AssertEach(
            resolution => [.. resolution.Cycles.Select(cycle => string.Join('>', cycle))],
            fixtureCase => fixtureCase.ExpectedCycles);

    [Fact]
    void should_consider_a_case_with_nothing_wrong_valid()
    {
        foreach (var (fixtureCase, resolution) in _results)
        {
            var expectedValid = fixtureCase.ExpectedUnplaced.Count == 0 && fixtureCase.ExpectedCycles.Count == 0;
            (fixtureCase.Name, resolution.IsValid).ShouldEqual((fixtureCase.Name, expectedValid));
        }
    }

    void AssertEach(Func<ScreenTemplateResolution, IReadOnlyList<string>> actual, Func<FixtureCase, IReadOnlyList<string>> expected)
    {
        foreach (var (fixtureCase, resolution) in _results)
        {
            (fixtureCase.Name, string.Join(',', actual(resolution))).ShouldEqual((fixtureCase.Name, string.Join(',', expected(fixtureCase))));
        }
    }

    static FixtureCase ToFixtureCase(JsonElement element) =>
        new(
            element.GetProperty("name").GetString()!,
            ToLayout(element.GetProperty("layout")),
            [.. element.GetProperty("templates").EnumerateArray().Select(ToTemplate)],
            [.. element.GetProperty("expectedPlacements").EnumerateArray().Select(placement =>
                $"{placement.GetProperty("template").GetString()}@{placement.GetProperty("slot").GetString()}->{placement.GetProperty("container").GetString()}#{placement.GetProperty("depth").GetInt32()}")],
            [.. element.GetProperty("expectedUnplaced").EnumerateArray().Select(unplaced =>
                $"{unplaced.GetProperty("template").GetString()}@{unplaced.GetProperty("slot").GetString()}?{string.Join('|', unplaced.GetProperty("candidates").EnumerateArray().Select(candidate => candidate.GetString()))}")],
            [.. element.GetProperty("expectedCycles").EnumerateArray().Select(cycle => string.Join('>', cycle.EnumerateArray().Select(name => name.GetString()!)))]);

    static Layout ToLayout(JsonElement element) =>
        new(element.GetProperty("name").GetString()!, [.. Slots(element)]);

    static ScreenTemplate ToTemplate(JsonElement element) =>
        new(
            element.GetProperty("name").GetString()!,
            element.GetProperty("fitsSlot").ValueKind == JsonValueKind.Null ? null : element.GetProperty("fitsSlot").GetString(),
            [.. Slots(element)]);

    static IEnumerable<Slot> Slots(JsonElement element) =>
        element.GetProperty("slots").EnumerateArray().Select(slot => new Slot(slot.GetString()!));

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
