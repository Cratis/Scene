// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Layouts;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.for_FlowArrangementEvaluator;

public class when_evaluating_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(string Name, FlowArrangement Arrangement, SizeClass SizeClass, string ExpectedTag);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, string ActualTag)> _results = null!;

    void Establish()
    {
        var manifestPath = Path.Combine(FindRepositoryRoot(), "layout-evaluation-fixtures.json");
        using var document = JsonDocument.Parse(File.ReadAllText(manifestPath));

        _cases = document.RootElement.GetProperty("flowCases").EnumerateArray().Select(ToFixtureCase).ToList();
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (fixtureCase, TagOf(FlowArrangementEvaluator.Evaluate(fixtureCase.Arrangement, fixtureCase.SizeClass))))];

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
        var root = Leaf(element.GetProperty("rootTag").GetString()!);

        var overrides = element.GetProperty("overrides").EnumerateArray()
            .Select(overrideElement => new FlowOverride(
                ParseWidth(overrideElement),
                ParseHeight(overrideElement),
                Leaf(overrideElement.GetProperty("tag").GetString()!)))
            .ToList();

        var sizeClassElement = element.GetProperty("sizeClass");
        var sizeClass = new SizeClass(
            Enum.Parse<WidthSizeClass>(sizeClassElement.GetProperty("width").GetString()!),
            Enum.Parse<HeightSizeClass>(sizeClassElement.GetProperty("height").GetString()!));

        var expectedTag = element.GetProperty("expectedTag").GetString()!;

        return new(name, new FlowArrangement(root, overrides), sizeClass, expectedTag);
    }

    static WidthSizeClass? ParseWidth(JsonElement overrideElement)
    {
        var widthElement = overrideElement.GetProperty("width");
        return widthElement.ValueKind == JsonValueKind.Null ? null : Enum.Parse<WidthSizeClass>(widthElement.GetString()!);
    }

    static HeightSizeClass? ParseHeight(JsonElement overrideElement)
    {
        var heightElement = overrideElement.GetProperty("height");
        return heightElement.ValueKind == JsonValueKind.Null ? null : Enum.Parse<HeightSizeClass>(heightElement.GetString()!);
    }

    static FlowLeaf Leaf(string tag) => new(new ExternalComponent { Id = tag, Name = tag, ComponentName = "core:text" });

    static string TagOf(FlowNode node) => ((FlowLeaf)node).Content.Id;

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
