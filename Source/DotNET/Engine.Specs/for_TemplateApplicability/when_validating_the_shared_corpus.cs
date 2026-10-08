// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_TemplateApplicability;

public class when_validating_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, IReadOnlyList<string> Problems)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "template-applicability-fixtures.json")));
        _cases = document.RootElement.GetProperty("cases").Deserialize<List<FixtureCase>>(_options)!;
    }

    void Because() => _results = [.. _cases.Select(fixture => (fixture, Validate(fixture)))];

    [Fact]
    void should_report_the_same_diagnostics_as_the_typescript_engine()
    {
        foreach (var (fixture, problems) in _results)
        {
            (fixture.Name, string.Join('|', problems)).ShouldEqual((fixture.Name, string.Join('|', fixture.ExpectedProblems)));
        }
    }

    static IReadOnlyList<string> Validate(FixtureCase fixture) => fixture.Kind switch
    {
        "Layout" => TemplateApplicability.ValidateLayout(Definition<Layout>(fixture), fixture.Scope),
        "DialogTemplate" => TemplateApplicability.ValidateDialogTemplate(Definition<DialogTemplate>(fixture), fixture.Scope),
        _ => TemplateApplicability.ValidateScreenTemplate(Definition<ScreenTemplate>(fixture), fixture.Scope, fixture.Container)
    };

    static T? Definition<T>(FixtureCase fixture)
        where T : class =>
        fixture.Definition.ValueKind == JsonValueKind.Undefined ? null : fixture.Definition.Deserialize<T>(_options);

    record FixtureCase(string Name, string Kind, TemplateScope Scope, JsonElement Definition, TemplateContainer? Container, IReadOnlyList<string> ExpectedProblems);
}
