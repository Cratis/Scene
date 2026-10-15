// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Toolbar.for_ToolbarButtonValidation;

public class when_validating_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    static readonly JsonSerializerOptions _write = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    ApplicationStructureIndex _index = null!;
    List<FixtureCase> _cases = null!;
    List<ItemCase> _itemCases = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "toolbar-slice-fixtures.json")));
        _index = new ApplicationStructureIndex(document.RootElement.GetProperty("structure").Deserialize<ApplicationStructure>(_options)!);
        _cases = document.RootElement.GetProperty("cases").Deserialize<List<FixtureCase>>(_options)!;
        _itemCases = document.RootElement.GetProperty("itemCases").Deserialize<List<ItemCase>>(_options)!;
    }

    [Fact]
    void should_carry_a_vector_for_every_diagnostic_code() =>
        _cases.SelectMany(fixture => fixture.ExpectedDiagnostics).Select(diagnostic => diagnostic.Code).Distinct().Order()
            .ShouldContainOnly(Enum.GetNames<ToolbarDiagnosticCode>().Select(ToCamelCase).Order());

    [Fact]
    void should_report_the_same_diagnostics_as_the_typescript_engine()
    {
        foreach (var fixture in _cases)
        {
            var actual = ToolbarButtonValidation.Validate(_index, fixture.Toolbar).Select(diagnostic => $"{ToCamelCase(diagnostic.Code.ToString())}|{ToCamelCase(diagnostic.Severity.ToString())}|{diagnostic.Button}|{diagnostic.Message}");
            var expected = fixture.ExpectedDiagnostics.Select(diagnostic => $"{diagnostic.Code}|{diagnostic.Severity}|{diagnostic.Button}|{diagnostic.Message}");
            (fixture.Name, string.Join('\n', actual)).ShouldEqual((fixture.Name, string.Join('\n', expected)));
        }
    }

    [Fact]
    void should_resolve_the_same_buttons_as_the_typescript_engine()
    {
        foreach (var fixture in _cases)
        {
            var actual = fixture.Toolbar.Buttons.Select(button => Describe(ToolbarButtons.Resolve(_index, button, fixture.DefaultDialogTemplate)));
            (fixture.Name, string.Join('\n', actual)).ShouldEqual((fixture.Name, string.Join('\n', fixture.Resolved)));
        }
    }

    [Fact]
    void should_read_the_same_buttons_from_items_as_the_typescript_engine()
    {
        foreach (var fixture in _itemCases)
        {
            var properties = fixture.Properties.EnumerateObject().ToDictionary(property => property.Name, property => (object?)property.Value.Clone());
            var actual = ToolbarButtons.FromItem(fixture.Id, properties);
            var expected = fixture.Expected.ValueKind == JsonValueKind.Null ? "null" : Canonical(fixture.Expected);
            (fixture.Name, actual is null ? "null" : Canonical(JsonSerializer.SerializeToElement(actual, _write))).ShouldEqual((fixture.Name, expected));
        }
    }

    static string Describe(ResolvedToolbarButton button) =>
        $"{button.Id}|{button.Slice ?? "-"}|{button.Command ?? "-"}|{button.Dialog?.Template ?? "-"}:{(button.Dialog is null ? "-" : ToCamelCase(button.Dialog.Source.ToString()))}|{ToCamelCase(button.Emphasis.ToString())}|{(button.Converted ? "converted" : "direct")}";

    static string Canonical(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.Object => "{" + string.Join(',', element.EnumerateObject().OrderBy(property => property.Name, StringComparer.Ordinal).Select(property => $"\"{property.Name}\":{Canonical(property.Value)}")) + "}",
        JsonValueKind.Array => "[" + string.Join(',', element.EnumerateArray().Select(Canonical)) + "]",
        _ => element.GetRawText()
    };

    static string ToCamelCase(string name) => char.ToLowerInvariant(name[0]) + name[1..];

    record ExpectedDiagnostic(string Code, string Severity, string Message, string Button);

    record FixtureCase(string Name, Model.Toolbar.Toolbar Toolbar, string? DefaultDialogTemplate, IReadOnlyList<string> Resolved, IReadOnlyList<ExpectedDiagnostic> ExpectedDiagnostics);

    record ItemCase(string Name, string Id, JsonElement Properties, JsonElement Expected);
}
