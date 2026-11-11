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

    static readonly JsonSerializerOptions _raw = new()
    {
        Converters = { new JsonStringEnumConverter() },
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    List<VerificationCase> _verification = null!;
    List<CatalogCase> _catalog = null!;
    List<PinCase> _pin = null!;
    List<CompareCase> _compare = null!;
    List<string> _pristine = null!;
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

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory.FullName, "blueprint-verification-fixtures.json")));
        _verification = document.RootElement.GetProperty("verification").Deserialize<List<VerificationCase>>(_options);
        _catalog = document.RootElement.GetProperty("catalog").Deserialize<List<CatalogCase>>(_options);
        _pin = document.RootElement.GetProperty("pin").Deserialize<List<PinCase>>(_options);
        _compare = document.RootElement.GetProperty("compare").Deserialize<List<CompareCase>>(_options);
        _pristine = [.. _verification.Select(Snapshot)];
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
    void should_write_the_problems_in_the_order_they_are_found()
    {
        var fixture = _verification.Single(candidate => candidate.Name == "screen set that is inconsistent");

        var written = JsonSerializer.Serialize(BlueprintVerification.Verify(fixture.Source, fixture.Library, fixture.Options), _raw);

        written.ShouldEqual("[\"Blueprint '@cratis/scene.blueprint.crm' declares screen 'Leads' more than once\",\"Blueprint '@cratis/scene.blueprint.crm' declares a screen set entry without a name\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'Leads' uses template 'Missing', which is not available\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'Leads' declares no title\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'Orphan' has parent 'Nowhere', which is not in the screen set\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'Orphan' is named in the screen set but the package does not provide it\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'A' is named in the screen set but the package does not provide it\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'B' is named in the screen set but the package does not provide it\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'A' is its own ancestor\",\"Blueprint '@cratis/scene.blueprint.crm' screen 'B' is its own ancestor\"]");
    }

    [Fact]
    void should_leave_the_blueprint_the_library_and_the_options_as_they_were()
    {
        var mismatches = _verification.Where((fixture, index) => Snapshot(fixture) != _pristine[index]).Select(fixture => fixture.Name);

        mismatches.ShouldBeEmpty();
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

    static string Snapshot(VerificationCase fixture) => JsonSerializer.Serialize(new { fixture.Source, fixture.Library, fixture.Options }, _raw);

    record VerificationCase(string Name, BlueprintSource Source, IReadOnlyList<TemplateSource> Library, BlueprintVerificationOptions? Options, IReadOnlyList<string> ExpectedProblems);

    record CatalogCase(string Name, IReadOnlyList<TemplateSource> Sources, IReadOnlyList<BlueprintCatalogEntry> ExpectedEntries);

    record PinCase(string Name, string? Pin, string Installed, string? Latest, BlueprintPinEvaluation Expected);

    record CompareCase(string Left, string Right, int Expected);
}
