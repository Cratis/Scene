// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Engine.Navigation.for_NavigationDiagnostics;

public class when_diagnosing_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, IReadOnlyList<NavigationDiagnostic> Diagnostics)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "navigation-diagnostic-fixtures.json")));
        _cases = document.RootElement.GetProperty("cases").Deserialize<List<FixtureCase>>(_options)!;
    }

    void Because() => _results = [.. _cases.Select(fixture => (fixture, NavigationDiagnostics.Diagnose(fixture.Graph)))];

    [Fact]
    void should_carry_negative_vectors_for_every_diagnostic_code() =>
        _cases.SelectMany(fixture => fixture.ExpectedDiagnostics).Select(diagnostic => diagnostic.Code).Distinct().Order()
            .ShouldContainOnly(Enum.GetNames<NavigationDiagnosticCode>().Select(ToCamelCase).Order());

    [Fact]
    void should_report_the_same_diagnostics_as_the_typescript_engine()
    {
        foreach (var (fixture, diagnostics) in _results)
        {
            var actual = diagnostics.Select(diagnostic => $"{ToCamelCase(diagnostic.Code.ToString())}|{diagnostic.Entry}|{diagnostic.Message}");
            var expected = fixture.ExpectedDiagnostics.Select(diagnostic => $"{diagnostic.Code}|{diagnostic.Entry}|{diagnostic.Message}");
            (fixture.Name, string.Join('\n', actual)).ShouldEqual((fixture.Name, string.Join('\n', expected)));
        }
    }

    static string ToCamelCase(string name) => char.ToLowerInvariant(name[0]) + name[1..];

    record ExpectedDiagnostic(string Code, string Message, string? Entry);

    record FixtureCase(string Name, NavigationGraph Graph, IReadOnlyList<ExpectedDiagnostic> ExpectedDiagnostics);
}
