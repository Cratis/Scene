// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData.for_SampleData;

public class when_running_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    JsonElement _corpus;
    List<(string Name, string Expected, string Actual)> _generation = null!;
    List<(string Name, string Expected, string Actual)> _inference = null!;
    List<(string Name, JsonNode? Expected, JsonNode? Actual)> _resolution = null!;
    List<(string Name, IReadOnlyList<string> Expected, IReadOnlyList<string> Actual)> _packValidation = null!;
    List<(string Name, IReadOnlyList<string> Expected, IReadOnlyList<string> Actual)> _selectionValidation = null!;
    List<(string Name, IReadOnlyList<string> Expected, IReadOnlyList<string> Actual)> _packageValidation = null!;
    List<(string Name, JsonNode? Expected, JsonNode? Actual)> _catalog = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _corpus = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "sample-data-resolution-fixtures.json"))).RootElement;
    }

    void Because()
    {
        _generation = [.. _corpus.GetProperty("generation").EnumerateArray().Select(Generate)];
        _inference = [.. _corpus.GetProperty("inference").EnumerateArray().Select(Infer)];
        _resolution = [.. _corpus.GetProperty("resolution").EnumerateArray().Select(Resolve)];
        _packValidation = [.. _corpus.GetProperty("packValidation").EnumerateArray().Select(fixture => (
            Name(fixture),
            Problems(fixture),
            SampleDataValidation.ValidatePack(fixture.GetProperty("pack").Deserialize<SampleDataPack>(_options)!)))];
        _selectionValidation = [.. _corpus.GetProperty("selectionValidation").EnumerateArray().Select(fixture => (
            Name(fixture),
            Problems(fixture),
            SampleDataValidation.ValidateSelection(
                fixture.GetProperty("selection").Deserialize<SampleDataSelection>(_options)!,
                fixture.GetProperty("packs").Deserialize<List<SampleDataPack>>(_options)!)))];
        _packageValidation = [.. _corpus.GetProperty("packageValidation").EnumerateArray().Select(fixture => (
            Name(fixture),
            Problems(fixture),
            SampleDataValidation.ValidatePackages(fixture.GetProperty("sources").Deserialize<List<SampleDataPackSource>>(_options)!)))];
        _catalog = [.. _corpus.GetProperty("catalog").EnumerateArray().Select(DescribeCatalog)];
    }

    [Fact]
    void should_have_cases_for_every_section() =>
        (_generation.Count > 0 && _inference.Count > 0 && _resolution.Count > 0 && _packValidation.Count > 0 && _selectionValidation.Count > 0 && _packageValidation.Count > 0 && _catalog.Count > 0)
            .ShouldBeTrue();

    [Fact]
    void should_generate_the_golden_rows_byte_for_byte_like_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _generation)
        {
            (name, actual).ShouldEqual((name, expected));
        }
    }

    [Fact]
    void should_infer_the_same_field_kinds_as_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _inference)
        {
            (name, actual).ShouldEqual((name, expected));
        }
    }

    [Fact]
    void should_resolve_the_same_as_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _resolution)
        {
            (name, JsonNode.DeepEquals(expected, actual) ? string.Empty : actual?.ToJsonString()).ShouldEqual((name, string.Empty));
        }
    }

    [Fact]
    void should_carry_the_resolved_rows_byte_for_byte_like_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _resolution)
        {
            (name, actual?["rows"]?.ToJsonString()).ShouldEqual((name, expected?["rows"]?.ToJsonString()));
        }
    }

    [Fact]
    void should_report_the_same_pack_problems_as_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _packValidation)
        {
            (name, string.Join('\n', actual)).ShouldEqual((name, string.Join('\n', expected)));
        }
    }

    [Fact]
    void should_report_the_same_selection_problems_as_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _selectionValidation)
        {
            (name, string.Join('\n', actual)).ShouldEqual((name, string.Join('\n', expected)));
        }
    }

    [Fact]
    void should_report_the_same_package_problems_as_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _packageValidation)
        {
            (name, string.Join('\n', actual)).ShouldEqual((name, string.Join('\n', expected)));
        }
    }

    [Fact]
    void should_describe_the_same_catalog_as_the_typescript_engine()
    {
        foreach (var (name, expected, actual) in _catalog)
        {
            (name, JsonNode.DeepEquals(expected, actual) ? string.Empty : actual?.ToJsonString()).ShouldEqual((name, string.Empty));
        }
    }

    static string Name(JsonElement fixture) => fixture.GetProperty("name").GetString()!;

    static IReadOnlyList<string> Problems(JsonElement fixture) => [.. fixture.GetProperty("expectedProblems").EnumerateArray().Select(problem => problem.GetString()!)];

    static (string Name, string Expected, string Actual) Generate(JsonElement fixture)
    {
        var shape = fixture.GetProperty("shape").Deserialize<SampleShape>(_options)!;
        var seed = fixture.TryGetProperty("seed", out var seedElement) ? seedElement.GetInt64() : (long?)null;
        var rowCount = fixture.TryGetProperty("rowCount", out var countElement) ? countElement.GetInt32() : (int?)null;
        var locale = fixture.TryGetProperty("locale", out var localeElement) ? localeElement.GetString() : null;
        var rows = SampleDataGenerator.Generate(shape, seed, rowCount, locale);
        var expected = fixture.GetProperty("expectedRows");
        if (expected.ValueKind == JsonValueKind.Array)
        {
            return (Name(fixture), JsonNode.Parse(expected.GetRawText())!.ToJsonString(), new JsonArray([.. rows.Select(row => row.DeepClone())]).ToJsonString());
        }

        var summary = $"{rows.Count}|{rows[0].ToJsonString()}|{rows[^1].ToJsonString()}";
        var expectedSummary = $"{expected.GetProperty("count").GetInt32()}|{JsonNode.Parse(expected.GetProperty("first").GetRawText())!.ToJsonString()}|{JsonNode.Parse(expected.GetProperty("last").GetRawText())!.ToJsonString()}";
        return (Name(fixture), expectedSummary, summary);
    }

    static (string Name, string Expected, string Actual) Infer(JsonElement fixture)
    {
        var field = fixture.GetProperty("field").Deserialize<SampleShapeField>(_options)!;
        var kind = JsonSerializer.Serialize(SampleFieldKindInference.Infer(field), _options).Trim('"');
        return (Name(fixture), fixture.GetProperty("expectedKind").GetString()!, kind);
    }

    static (string Name, JsonNode? Expected, JsonNode? Actual) Resolve(JsonElement fixture)
    {
        var request = fixture.GetProperty("request").Deserialize<SampleDataRequest>(_options)!;
        var context = fixture.GetProperty("context").Deserialize<SampleDataContext>(_options)!;
        var resolution = SampleDataResolver.Resolve(request, context);
        return (Name(fixture), JsonNode.Parse(fixture.GetProperty("expected").GetRawText()), JsonSerializer.SerializeToNode(resolution, _options));
    }

    static (string Name, JsonNode? Expected, JsonNode? Actual) DescribeCatalog(JsonElement fixture)
    {
        var sources = fixture.GetProperty("sources").Deserialize<List<SampleDataPackSource>>(_options)!;
        var own = fixture.GetProperty("ownPacks").Deserialize<List<SampleDataPackReference>>(_options)!;
        var active = fixture.TryGetProperty("activePack", out var activeElement) ? activeElement.GetString() : null;
        var catalog = SampleDataCatalogs.Describe(sources, own, active);
        return (Name(fixture), JsonNode.Parse(fixture.GetProperty("expected").GetRawText()), JsonSerializer.SerializeToNode(catalog, _options));
    }
}
