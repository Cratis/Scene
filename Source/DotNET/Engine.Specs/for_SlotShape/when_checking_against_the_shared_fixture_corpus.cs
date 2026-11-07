// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Engine.Slots.for_SlotShape;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    JsonNode _corpus = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "slot-shape-fixtures.json")))!;
    }

    [Fact] void should_state_the_same_migration_hint() => SlotShapeValidator.MigrationHint.ShouldEqual(_corpus["hint"]!.GetValue<string>());

    [Fact]
    void should_cover_every_diagnostic_code()
    {
        var covered = Cases("upgrades").SelectMany(fixture => fixture["expected"]!["diagnostics"]!.AsArray())
            .Concat(Cases("validations").SelectMany(fixture => fixture["expected"]!.AsArray()))
            .Select(diagnostic => diagnostic!["code"]!.GetValue<string>())
            .Distinct()
            .Order();
        covered.ShouldContainOnly(Enum.GetNames<SlotShapeDiagnosticCode>().Select(ToCamelCase).Order());
    }

    [Fact]
    void should_resolve_every_role()
    {
        var mismatches = Cases("roles")
            .Where(fixture => !string.Equals(SlotRoles.Resolve(fixture["slot"].Deserialize<Slot>(_options)!).ToString(), fixture["expected"]!.GetValue<string>(), StringComparison.OrdinalIgnoreCase))
            .Select(fixture => fixture["name"]!.GetValue<string>());
        mismatches.ShouldBeEmpty();
    }

    [Fact]
    void should_find_every_primary_slot()
    {
        var mismatches = Cases("primary")
            .Where(fixture => SlotRoles.PrimaryOf(fixture["slots"].Deserialize<List<Slot>>(_options)) != fixture["expected"]?.GetValue<string>())
            .Select(fixture => fixture["name"]!.GetValue<string>());
        mismatches.ShouldBeEmpty();
    }

    [Fact]
    void should_upgrade_every_document()
    {
        var mismatches = new List<string>();
        foreach (var fixture in Cases("upgrades"))
        {
            var input = fixture["input"]!.DeepClone();
            var result = SlotShapeUpgrader.Upgrade(input);
            var expected = fixture["expected"]!;
            if (!JsonNode.DeepEquals(result.Document, expected["document"]))
            {
                mismatches.Add($"{fixture["name"]}: document {result.Document?.ToJsonString()}");
            }

            if (result.Changed != expected["changed"]!.GetValue<bool>())
            {
                mismatches.Add($"{fixture["name"]}: changed {result.Changed}");
            }

            if (!Describe(result.Diagnostics).SequenceEqual(Describe(expected["diagnostics"]!.AsArray())))
            {
                mismatches.Add($"{fixture["name"]}: diagnostics {string.Join(" / ", Describe(result.Diagnostics))}");
            }

            if (!JsonNode.DeepEquals(input, fixture["input"]))
            {
                mismatches.Add($"{fixture["name"]}: changed its input");
            }

            var again = SlotShapeUpgrader.Upgrade(result.Document);
            if (again.Changed || !JsonNode.DeepEquals(again.Document, result.Document))
            {
                mismatches.Add($"{fixture["name"]}: not idempotent");
            }
        }

        mismatches.ShouldBeEmpty();
    }

    [Fact]
    void should_validate_every_document()
    {
        var mismatches = Cases("validations")
            .Where(fixture => !Describe(SlotShapeValidator.Validate(fixture["document"])).SequenceEqual(Describe(fixture["expected"]!.AsArray())))
            .Select(fixture => $"{fixture["name"]}: {string.Join(" / ", Describe(SlotShapeValidator.Validate(fixture["document"])))}");
        mismatches.ShouldBeEmpty();
    }

    [Fact]
    void should_upgrade_every_mappable_document_into_the_slot_shape()
    {
        var unexpected = Cases("upgrades")
            .Where(fixture => fixture["expected"]!["diagnostics"]!.AsArray().Count == 0
                && SlotShapeValidator.Validate(SlotShapeUpgrader.Upgrade(fixture["input"]).Document).Count > 0)
            .Select(fixture => fixture["name"]!.GetValue<string>());
        unexpected.ShouldBeEmpty();
    }

    IEnumerable<JsonNode> Cases(string section) => _corpus[section]!.AsArray().Select(fixture => fixture!);

    static IEnumerable<string> Describe(IEnumerable<SlotShapeDiagnostic> diagnostics) =>
        diagnostics.Select(diagnostic => $"{ToCamelCase(diagnostic.Code.ToString())}|{diagnostic.Path}|{diagnostic.Message}");

    static IEnumerable<string> Describe(JsonArray diagnostics) =>
        diagnostics.Select(diagnostic => $"{diagnostic!["code"]}|{diagnostic["path"]}|{diagnostic["message"]}");

    static string ToCamelCase(string name) => JsonNamingPolicy.CamelCase.ConvertName(name);
}
