// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Outlets.for_EffectiveOutlets;

public class when_building_the_chain_of_a_screen : Specification
{
    static readonly JsonSerializerOptions _read = SceneJson.Options;

    JsonArray _chains = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _chains = JsonNode.Parse(File.ReadAllText(Path.Combine(directory.FullName, "outlet-resolution-fixtures.json")))["chains"].AsArray();
    }

    [Fact]
    void should_build_every_chain_and_resolve_through_it()
    {
        var mismatches = new List<string>();
        foreach (var fixture in _chains.Select(node => node))
        {
            var name = fixture["name"].GetValue<string>();
            var built = OutletChains.Of(Source(fixture["source"]), fixture["screen"].GetValue<string>());
            var chain = new JsonArray([.. built.Chain.Select(level => (JsonNode)JsonValue.Create(Describe(level)))]);
            var contributors = new JsonArray([.. built.Contributors.Select(level => (JsonNode)JsonValue.Create(Describe(level)))]);
            if (!JsonNode.DeepEquals(chain, fixture["expected"]["chain"])) mismatches.Add($"{name} / chain: {chain.ToJsonString()}");
            if (!JsonNode.DeepEquals(contributors, fixture["expected"]["contributors"])) mismatches.Add($"{name} / contributors: {contributors.ToJsonString()}");

            foreach (var entry in fixture["resolve"].AsArray())
            {
                var outlet = entry["outlet"].GetValue<string>();
                var resolved = EffectiveOutlets.Resolve(built.Chain, outlet, built.Contributors);
                var summary = new JsonArray([.. resolved.Items.Select(item => (JsonNode)JsonValue.Create(
                    $"{item.Item.Id}|{Camel(item.Item.Kind.ToString())}|{item.Provenance.Owner}|{Camel(item.Provenance.Level.ToString())}|{Camel(item.Provenance.Source.ToString())}|{(item.Editable ? "editable" : "locked")}"))]);
                if (!JsonNode.DeepEquals(summary, entry["expected"]["items"]) || resolved.Summary != entry["expected"]["summary"].GetValue<string>())
                {
                    mismatches.Add($"{name} / {outlet}: {resolved.Summary} {summary.ToJsonString()}");
                }
            }
        }

        mismatches.ShouldBeEmpty();
    }

    static OutletChainSource Source(JsonNode source) => new(
        source["layouts"].Deserialize<List<Layout>>(_read),
        source["screenTemplates"].Deserialize<List<ScreenTemplate>>(_read),
        source["screens"].Deserialize<List<Screen>>(_read),
        source["navigation"].Deserialize<NavigationModel>(_read),
        source["levels"].Deserialize<List<OutletLevel>>(_read));

    static string Camel(string name) => char.ToLowerInvariant(name[0]) + name[1..];

    static string Names(IEnumerable<string> names) => names.Any() ? string.Join(',', names) : "-";

    static string Describe(OutletLevel level) =>
        $"{Camel(level.Kind.ToString())}|{level.Name}|outlets:{Names((level.Outlets ?? []).Select(outlet => outlet.Name))}|refinements:{Names((level.Refinements ?? []).Select(refinement => refinement.Outlet))}|contributions:{Names((level.Contributions ?? []).Select(contribution => contribution.Outlet))}";
}
