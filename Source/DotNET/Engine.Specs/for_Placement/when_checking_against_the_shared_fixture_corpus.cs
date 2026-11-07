// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Outlets;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Elements;

namespace Cratis.Scene.Engine.Placement.for_Placement;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _read = SceneJson.Options;

    static readonly JsonSerializerOptions _write = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    JsonNode _corpus = null!;
    ActionInspectionContext _context = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "placement-fixtures.json")))!;
        _context = _corpus["inspection"]!["context"].Deserialize<ActionInspectionContext>(_read)!;
    }

    [Fact]
    void should_cover_every_placement_problem() =>
        Cases("placement")
            .Select(fixture => fixture["expected"]!["problem"]?.GetValue<string>())
            .OfType<string>()
            .Distinct()
            .Order()
            .ShouldContainOnly(Enum.GetNames<PlacementProblem>().Select(JsonNamingPolicy.CamelCase.ConvertName).Order());

    [Fact]
    void should_place_every_action() =>
        Mismatches("placement", fixture => PlacementResolver.Resolve(fixture["request"].Deserialize<PlacementRequest>(_read)!)).ShouldBeEmpty();

    [Fact]
    void should_work_out_every_enablement() =>
        Mismatches("enablement", fixture => EnablementResolver.Resolve(fixture["request"].Deserialize<EnablementRequest>(_read)!)).ShouldBeEmpty();

    [Fact]
    void should_inspect_the_actions_of_every_outlet() =>
        Mismatches(_corpus["inspection"]!["outlets"]!.AsArray(), fixture => ActionInspector.InspectOutlet(fixture["outlet"].Deserialize<EffectiveOutlet>(_read)!, _context)).ShouldBeEmpty();

    [Fact]
    void should_inspect_every_action_component() =>
        Mismatches(_corpus["inspection"]!["elements"]!.AsArray(), fixture => ActionInspector.InspectElement(fixture["element"].Deserialize<ExternalComponent>(_read)!, _context)).ShouldBeEmpty();

    [Fact]
    void should_tell_where_every_argument_source_gets_its_value()
    {
        var mismatches = Cases("argumentSources")
            .Where(fixture =>
            {
                var actual = ActionInspector.ArgumentSourceKind(fixture["source"]!.GetValue<string>()) is { } kind ? JsonNamingPolicy.CamelCase.ConvertName(kind.ToString()) : null;
                return actual != fixture["expected"]?.GetValue<string>();
            })
            .Select(fixture => fixture["source"]!.GetValue<string>());
        mismatches.ShouldBeEmpty();
    }

    IEnumerable<JsonNode> Cases(string name) => _corpus[name]!.AsArray().Select(fixture => fixture!);

    List<string> Mismatches<T>(string name, Func<JsonNode, T> act) => Mismatches(_corpus[name]!.AsArray(), act);

    static List<string> Mismatches<T>(JsonArray fixtures, Func<JsonNode, T> act)
    {
        var mismatches = new List<string>();
        foreach (var fixture in fixtures.Select(fixture => fixture!))
        {
            var actual = JsonSerializer.SerializeToNode(act(fixture), _write);
            if (!JsonNode.DeepEquals(actual, fixture["expected"]))
            {
                mismatches.Add($"{fixture["name"]}: {actual?.ToJsonString()}");
            }
        }

        return mismatches;
    }
}
