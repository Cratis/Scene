// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Layouts;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.for_FreeformArrangementEvaluator;

public class when_evaluating_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, FreeformArrangement Arrangement, SizeClass SizeClass, string? ExpectedTag);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, string? ActualTag)> _results = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "layout-evaluation-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _cases = document.RootElement.GetProperty("freeformCases").EnumerateArray().Select(ToFixtureCase).ToList();
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, TagOf(FreeformArrangementEvaluator.Evaluate(fixtureCase.Arrangement, fixtureCase.SizeClass))))];

    [Fact]
    void should_match_the_expected_tag_for_every_case()
    {
        foreach (var (fixtureCase, actualTag) in _results)
        {
            (fixtureCase.Name, actualTag).ShouldEqual((fixtureCase.Name, fixtureCase.ExpectedTag));
        }
    }

    static FixtureCase ToFixtureCase(JsonElement element)
    {
        var name = element.GetProperty("name").GetString()!;

        var variants = element.GetProperty("variants").EnumerateArray()
            .Select(variantElement => new FreeformVariant(
                new SizeClass(
                    Enum.Parse<WidthSizeClass>(variantElement.GetProperty("width").GetString()!),
                    Enum.Parse<HeightSizeClass>(variantElement.GetProperty("height").GetString()!)),
                [Placement(variantElement.GetProperty("tag").GetString()!)]))
            .ToList();

        var sizeClassElement = element.GetProperty("sizeClass");
        var sizeClass = new SizeClass(
            Enum.Parse<WidthSizeClass>(sizeClassElement.GetProperty("width").GetString()!),
            Enum.Parse<HeightSizeClass>(sizeClassElement.GetProperty("height").GetString()!));

        var expectedTagElement = element.GetProperty("expectedTag");
        var expectedTag = expectedTagElement.ValueKind == JsonValueKind.Null ? null : expectedTagElement.GetString();

        return new(name, new FreeformArrangement(variants), sizeClass, expectedTag);
    }

    static ElementPlacement Placement(string tag) => new(new ExternalComponent { Id = tag, Name = tag, ComponentName = "core:text" }, 0, 0, 0, 0);

    static string? TagOf(FreeformVariant? variant) => variant?.Placements.Single().Element.Id;

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
