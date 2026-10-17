// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Engine.Profiles.for_ProfileRegions;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    JsonArray _cases = null!;
    List<(string Name, JsonNode? Expected, JsonNode? Actual)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _cases = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "shell-regions-fixtures.json")))!["cases"]!.AsArray();
    }

    void Because() => _results = [.. _cases.Select(item =>
    {
        var mode = ShellOptions.Normalize(item!["mode"]!.GetValue<string>())!.Value;
        var regions = ProfileRegions.Describe(mode, item["touch"]!.GetValue<bool>(), item["menuOpen"]!.GetValue<bool>());
        return ($"{item["mode"]} {item["touch"]} {item["menuOpen"]}", item["expected"], JsonSerializer.SerializeToNode(regions, _options));
    })];

    [Fact] void should_cover_every_mode_in_both_regimes_and_both_menu_states() => _results.Count.ShouldEqual(32);

    [Fact]
    void should_answer_what_the_corpus_expects() =>
        _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual))
            .Select(result => $"{result.Name}: expected {result.Expected?.ToJsonString()} but was {result.Actual?.ToJsonString()}")
            .ShouldBeEmpty();
}
