// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Engine.Templates;

namespace Cratis.Scene.Engine.Blueprints.for_Blueprints;

public class when_running_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    List<VerificationCase> _verification = null!;
    List<CatalogCase> _catalog = null!;
    List<PinCase> _pin = null!;
    List<CompareCase> _compare = null!;
    List<(VerificationCase Case, IReadOnlyList<string> Problems)> _verified = null!;
    List<(CatalogCase Case, IReadOnlyList<BlueprintCatalogEntry> Entries)> _described = null!;
    List<(PinCase Case, BlueprintPinEvaluation Evaluation)> _evaluated = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "blueprint-verification-fixtures.json")));
        _verification = document.RootElement.GetProperty("verification").Deserialize<List<VerificationCase>>(_options)!;
        _catalog = document.RootElement.GetProperty("catalog").Deserialize<List<CatalogCase>>(_options)!;
        _pin = document.RootElement.GetProperty("pin").Deserialize<List<PinCase>>(_options)!;
        _compare = document.RootElement.GetProperty("compare").Deserialize<List<CompareCase>>(_options)!;
    }

    void Because()
    {
        _verified = [.. _verification.Select(fixture => (fixture, BlueprintVerification.Verify(fixture.Source, fixture.Library, fixture.Options)))];
        _described = [.. _catalog.Select(fixture => (fixture, BlueprintCatalog.Describe(fixture.Sources)))];
        _evaluated = [.. _pin.Select(fixture => (fixture, BlueprintVersionPin.Evaluate(fixture.Pin, fixture.Installed, fixture.Latest)))];
    }

    [Fact]
    void should_verify_blueprints_like_the_typescript_engine()
    {
        foreach (var (fixture, problems) in _verified)
        {
            (fixture.Name, string.Join('\n', problems)).ShouldEqual((fixture.Name, string.Join('\n', fixture.ExpectedProblems)));
        }
    }

    [Fact]
    void should_describe_the_catalog_like_the_typescript_engine()
    {
        foreach (var (fixture, entries) in _described)
        {
            (fixture.Name, JsonSerializer.Serialize(entries, _options)).ShouldEqual((fixture.Name, JsonSerializer.Serialize(fixture.ExpectedEntries, _options)));
        }
    }

    [Fact]
    void should_evaluate_pins_like_the_typescript_engine()
    {
        foreach (var (fixture, evaluation) in _evaluated)
        {
            (fixture.Name, evaluation.Status, evaluation.Pin, evaluation.Message).ShouldEqual((fixture.Name, fixture.Expected.Status, fixture.Expected.Pin, fixture.Expected.Message));
        }
    }

    [Fact]
    void should_compare_versions_like_the_typescript_engine()
    {
        foreach (var fixture in _compare)
        {
            ((fixture.Left, fixture.Right), Math.Sign(PackageVersionRange.CompareVersions(fixture.Left, fixture.Right))).ShouldEqual(((fixture.Left, fixture.Right), fixture.Expected));
        }
    }

    record VerificationCase(string Name, BlueprintSource Source, IReadOnlyList<TemplateSource> Library, BlueprintVerificationOptions? Options, IReadOnlyList<string> ExpectedProblems);

    record CatalogCase(string Name, IReadOnlyList<TemplateSource> Sources, IReadOnlyList<BlueprintCatalogEntry> ExpectedEntries);

    record PinCase(string Name, string? Pin, string Installed, string? Latest, BlueprintPinEvaluation Expected);

    record CompareCase(string Left, string Right, int Expected);
}
