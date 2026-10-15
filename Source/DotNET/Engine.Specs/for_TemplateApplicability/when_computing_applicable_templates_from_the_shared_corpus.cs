// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_TemplateApplicability;

public class when_computing_applicable_templates_from_the_shared_corpus : Specification
{
    TemplateLibrary _library = null!;
    List<ApplicableCase> _cases = null!;
    List<(ApplicableCase Case, ApplicableTemplateSet Result)> _results = null!;

    void Establish()
    {
        var root = FixtureFile.Load();
        _library = root.GetProperty("library").Deserialize<TemplateLibrary>(FixtureFile.Options)!;
        _cases = root.GetProperty("applicable").Deserialize<List<ApplicableCase>>(FixtureFile.Options)!;
    }

    void Because() => _results = [.. _cases.Select(fixture => (fixture, ApplicableTemplates.Compute(_library, fixture.Target)))];

    [Fact]
    void should_offer_the_same_templates_as_the_typescript_engine()
    {
        foreach (var (fixture, result) in _results)
        {
            (fixture.Name, Describe(result)).ShouldEqual((fixture.Name, Describe(fixture.Expected)));
        }
    }

    [Fact]
    void should_never_list_a_blueprint_without_applicable_templates()
    {
        _results.SelectMany(result => result.Result.Blueprints).All(blueprint => blueprint.Categories.Count > 0).ShouldBeTrue();
    }

    [Fact]
    void should_reference_own_templates_by_name()
    {
        var references = _results.SelectMany(result => result.Result.Own).SelectMany(group => group.Templates).Select(template => template.Reference);
        references.All(reference => reference.Source == TemplateReferenceSource.Own && reference.Blueprint is null && reference.Version is null).ShouldBeTrue();
    }

    [Fact]
    void should_pin_blueprint_references_to_the_caret_range_of_the_installed_version()
    {
        foreach (var (fixture, result) in _results)
        {
            foreach (var blueprint in result.Blueprints)
            {
                var pin = fixture.Expected.Blueprints.Single(expected => expected.Blueprint == blueprint.Blueprint).Pin;
                blueprint.Categories.SelectMany(group => group.Templates).All(template =>
                    template.Reference.Source == TemplateReferenceSource.Blueprint &&
                    template.Reference.Blueprint == blueprint.Blueprint &&
                    template.Reference.Id == template.Name &&
                    template.Reference.Version == pin).ShouldBeTrue();
            }
        }
    }

    static string Describe(ApplicableTemplateSet set) =>
        $"own[{DescribeGroups(set.Own)}] blueprints[{string.Join(';', set.Blueprints.Select(blueprint => $"{blueprint.Blueprint}@{blueprint.Version}:{DescribeGroups(blueprint.Categories)}"))}]";

    static string Describe(ExpectedSet set) =>
        $"own[{DescribeGroups(set.Own)}] blueprints[{string.Join(';', set.Blueprints.Select(blueprint => $"{blueprint.Blueprint}@{blueprint.Version}:{DescribeGroups(blueprint.Categories)}"))}]";

    static string DescribeGroups(IEnumerable<ApplicableTemplateGroup> groups) =>
        string.Join('|', groups.Select(group => $"{group.Category ?? "(none)"}={string.Join(',', group.Templates.Select(template => template.Name))}"));

    static string DescribeGroups(IEnumerable<ExpectedGroup> groups) =>
        string.Join('|', groups.Select(group => $"{group.Category ?? "(none)"}={string.Join(',', group.Templates)}"));

    record ExpectedGroup(string? Category, IReadOnlyList<string> Templates);

    record ExpectedBlueprint(string Blueprint, string Version, string Pin, IReadOnlyList<ExpectedGroup> Categories);

    record ExpectedSet(IReadOnlyList<ExpectedGroup> Own, IReadOnlyList<ExpectedBlueprint> Blueprints);

    record ApplicableCase(string Name, TemplateTarget Target, ExpectedSet Expected);
}
