// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Structure.for_ApplicationStructureIndex;

public class when_querying_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, ApplicationStructureIndex Index)> _indexes = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "application-structure-fixtures.json")));
        _cases = document.RootElement.GetProperty("cases").Deserialize<List<FixtureCase>>(_options)!;
    }

    void Because() => _indexes = [.. _cases.Select(fixture => (fixture, new ApplicationStructureIndex(fixture.Structure)))];

    [Fact]
    void should_carry_a_negative_vector_for_every_diagnostic_code() =>
        _cases.SelectMany(fixture => fixture.ExpectedDiagnostics).Select(diagnostic => diagnostic.Code).Distinct().Order()
            .ShouldContainOnly(Enum.GetNames<StructureDiagnosticCode>().Select(ToCamelCase).Order());

    [Fact]
    void should_answer_every_query_as_the_typescript_engine_does()
    {
        foreach (var (fixture, index) in _indexes)
        {
            foreach (var query in fixture.Queries)
            {
                ($"{fixture.Name}: {query.Op}({query.Arg})", Answer(index, query)).ShouldEqual(($"{fixture.Name}: {query.Op}({query.Arg})", Describe(query.Expected)));
            }
        }
    }

    [Fact]
    void should_report_the_same_diagnostics_as_the_typescript_engine()
    {
        foreach (var (fixture, index) in _indexes)
        {
            var actual = index.Diagnostics.Select(diagnostic => $"{ToCamelCase(diagnostic.Code.ToString())}|{diagnostic.Id}|{diagnostic.Message}");
            var expected = fixture.ExpectedDiagnostics.Select(diagnostic => $"{diagnostic.Code}|{diagnostic.Id}|{diagnostic.Message}");
            (fixture.Name, string.Join('\n', actual)).ShouldEqual((fixture.Name, string.Join('\n', expected)));
        }
    }

    static string Answer(ApplicationStructureIndex index, Query query) => query.Op switch
    {
        "findModule" => Describe(index.FindModule(query.Arg)?.Name),
        "findFeature" => Describe(index.FindFeature(query.Arg)?.Name),
        "firstFeature" => Describe(index.FirstFeature(query.Arg)?.Name),
        "firstFeatureId" => Describe(index.FirstFeatureId(query.Arg)),
        "findSlice" => Describe(index.FindSlice(query.Arg)?.Name),
        "kindOf" => Describe(index.KindOf(query.Arg)?.ToString()),
        "featuresByName" => string.Join(',', index.FindFeaturesByName(query.Arg)),
        _ => throw new InvalidOperationException($"Unknown fixture operation '{query.Op}'.")
    };

    static string Describe(JsonElement expected) => expected.ValueKind switch
    {
        JsonValueKind.Array => string.Join(',', expected.EnumerateArray().Select(item => item.GetString())),
        JsonValueKind.String => expected.GetString()!,
        _ => "<none>"
    };

    static string Describe(string? value) => value ?? "<none>";

    static string ToCamelCase(string name) => char.ToLowerInvariant(name[0]) + name[1..];

    record Query(string Op, string Arg, JsonElement Expected);

    record ExpectedDiagnostic(string Code, string Message, string Id);

    record FixtureCase(string Name, ApplicationStructure Structure, IReadOnlyList<Query> Queries, IReadOnlyList<ExpectedDiagnostic> ExpectedDiagnostics);
}
