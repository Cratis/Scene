// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Toolbar;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Outlets;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Outlets.for_EffectiveOutlets;

public class when_resolving_the_shared_corpus : Specification
{
    static readonly JsonSerializerOptions _read = SceneJson.Options;

    static readonly JsonSerializerOptions _write = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    JsonNode _corpus = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory.FullName, "outlet-resolution-fixtures.json")));
    }

    [Fact]
    void should_take_the_item_kinds_the_corpus_lists_for_every_outlet_kind()
    {
        var actual = new JsonObject();
        foreach (var kind in Enum.GetValues<OutletKind>())
        {
            actual[OutletItemKinds.NameOf(kind)] = new JsonArray([.. OutletItemKinds.AllowedIn(kind).Select(item => (JsonNode)JsonValue.Create(Camel(item.ToString())))]);
        }
        JsonNode.DeepEquals(actual, _corpus["itemKinds"]).ShouldBeTrue();
    }

    [Fact]
    void should_cover_every_diagnostic_code()
    {
        var covered = Cases("cases")
            .SelectMany(fixture => fixture["expectedDiagnostics"].AsArray()
                .Concat(fixture["resolve"].AsArray().SelectMany(entry => entry["expected"]["diagnostics"].AsArray())))
            .Select(line => line.GetValue<string>().Split('|')[0])
            .Distinct()
            .Order();
        covered.ShouldContainOnly(Enum.GetNames<OutletDiagnosticCode>().Select(Camel).Order());
    }

    [Fact]
    void should_resolve_every_outlet()
    {
        var mismatches = new List<string>();
        foreach (var fixture in Cases("cases"))
        {
            var (chain, contributors) = Levels(fixture);
            foreach (var entry in fixture["resolve"].AsArray())
            {
                var outlet = entry["outlet"].GetValue<string>();
                var actual = Describe(EffectiveOutlets.Resolve(chain, outlet, contributors));
                if (!JsonNode.DeepEquals(actual, entry["expected"])) mismatches.Add($"{fixture["name"]} / {outlet}: {actual.ToJsonString()}");
            }
        }
        mismatches.ShouldBeEmpty();
    }

    [Fact]
    void should_diagnose_every_chain()
    {
        var mismatches = new List<string>();
        foreach (var fixture in Cases("cases"))
        {
            var (chain, contributors) = Levels(fixture);
            var actual = new JsonArray([.. OutletDiagnostics.Diagnose(chain, contributors).Select(diagnostic => (JsonNode)JsonValue.Create(Describe(diagnostic)))]);
            if (!JsonNode.DeepEquals(actual, fixture["expectedDiagnostics"])) mismatches.Add($"{fixture["name"]}: {actual.ToJsonString()}");
        }
        mismatches.ShouldBeEmpty();
    }

    [Fact]
    void should_offer_the_dialog_outlets()
    {
        var mismatches = Cases("dialogTemplates")
            .Where(fixture =>
            {
                var template = fixture["template"].Deserialize<DialogTemplate>(_read);
                var actual = new JsonArray([.. DialogTemplateOutlets.Of(template).Select(outlet => (JsonNode)JsonValue.Create(DescribeDialogOutlet(outlet)))]);
                return !JsonNode.DeepEquals(actual, fixture["expected"]);
            })
            .Select(fixture => fixture["name"].GetValue<string>());
        mismatches.ShouldBeEmpty();
    }

    [Fact]
    void should_refine_the_toolbar_outlet()
    {
        var mismatches = Cases("toolbars")
            .Where(fixture =>
            {
                var toolbar = fixture["toolbar"].Deserialize<Model.Toolbar.Toolbar>(_read);
                var actual = JsonSerializer.SerializeToNode(ToolbarOutlet.AsRefinement(toolbar), _write);
                return !JsonNode.DeepEquals(actual, fixture["expected"]);
            })
            .Select(fixture => fixture["name"].GetValue<string>());
        mismatches.ShouldBeEmpty();
    }

    static string Camel(string name) => char.ToLowerInvariant(name[0]) + name[1..];

    static string Describe(OutletDiagnostic diagnostic) =>
        $"{Camel(diagnostic.Code.ToString())}|{Camel(diagnostic.Severity.ToString())}|{diagnostic.Outlet}|{diagnostic.Owner ?? "-"}|{diagnostic.Item ?? "-"}|{diagnostic.Message}";

    static string KindOf(OutletItem item) => item is OutletGroup group
        ? $"group({string.Join(',', group.Items.Select(child => child.Id))})"
        : Camel(item.Kind.ToString());

    static JsonObject Describe(EffectiveOutlet outlet) => new()
    {
        ["kind"] = outlet.Kind is { } kind ? OutletItemKinds.NameOf(kind) : null,
        ["declaredBy"] = outlet.DeclaredBy,
        ["mode"] = outlet.Mode is { } mode ? Camel(mode.ToString()) : null,
        ["summary"] = outlet.Summary,
        ["items"] = new JsonArray([.. outlet.Items.Select(entry => (JsonNode)JsonValue.Create(
            $"{entry.Item.Id}|{KindOf(entry.Item)}|{entry.Provenance.Owner}|{Camel(entry.Provenance.Level.ToString())}|{Camel(entry.Provenance.Source.ToString())}|{(entry.Editable ? "editable" : "locked")}"))]),
        ["removed"] = new JsonArray([.. outlet.Removed.Select(entry => (JsonNode)JsonValue.Create(
            $"{entry.Item.Id}|{Camel(entry.Removal.ToString())}|by {entry.RemovedBy}|from {entry.Provenance.Owner}"))]),
        ["diagnostics"] = new JsonArray([.. outlet.Diagnostics.Select(diagnostic => (JsonNode)JsonValue.Create(Describe(diagnostic)))]),
    };

    static string DescribeDialogOutlet(Outlet outlet) =>
        $"{outlet.Name}|{OutletItemKinds.NameOf(outlet.Kind)}|{string.Join(',', outlet.Defaults.Select(item => item is OutletButton button
            ? $"{button.Id}:{(button.BuiltIn is { } builtIn ? Camel(builtIn.ToString()) : "-")}:{(button.Emphasis is { } emphasis ? Camel(emphasis.ToString()) : "-")}"
            : item.Id))}";

    (IReadOnlyList<OutletLevel> Chain, IReadOnlyList<OutletLevel> Contributors) Levels(JsonNode fixture) =>
        (fixture["chain"].Deserialize<List<OutletLevel>>(_read)!, fixture["contributors"]?.Deserialize<List<OutletLevel>>(_read) ?? []);

    IEnumerable<JsonNode> Cases(string name) => _corpus[name]!.AsArray().Select(fixture => fixture!);
}
