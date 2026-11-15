// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Design.for_DesignLinker;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };

    List<(string Name, JsonNode Expected, JsonNode Actual)> _results = null!;
    List<string> _coveredCodes = null!;

    void Because()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory.FullName, "design-link-fixtures.json")));
        _results = [.. corpus["cases"].AsArray().Select(item =>
        {
            var designSystem = item["designSystem"].Deserialize<DesignSystem>(_options);
            var profile = item["profile"].Deserialize<UiProfile>(_options);
            var catalog = item["catalog"].Deserialize<Dictionary<string, List<string>>>(_options)!
                .ToDictionary(entry => entry.Key, entry => (IReadOnlyList<string>)entry.Value);
            var components = item["components"].AsArray()
                .Select(component => new LinkableComponent(
                    component["component"].GetValue<string>(),
                    [.. component["properties"].AsArray().Select(property => property.GetValue<string>())],
                    component["anatomy"].Deserialize<ComponentAnatomy>(_options)))
                .ToList();

            var actual = JsonSerializer.SerializeToNode(DesignLinker.Link(designSystem!, profile!, catalog, components), _options);
            foreach (var diagnostic in actual["diagnostics"].AsArray())
            {
                var code = diagnostic["code"].GetValue<string>();
                diagnostic["code"] = char.ToLowerInvariant(code[0]) + code[1..];
            }

            return (item["name"].GetValue<string>(), item["expected"].DeepClone(), actual);
        })];
        _coveredCodes = [.. _results.SelectMany(result => result.Expected["diagnostics"].AsArray().Select(diagnostic => diagnostic["code"].GetValue<string>())).Distinct().Order(StringComparer.Ordinal)];
    }

    [Fact]
    void should_have_cases_in_the_corpus() => _results.Count.ShouldBeGreaterThan(8);

    [Fact]
    void should_cover_every_diagnostic_code() => _coveredCodes.ShouldEqual(
        [.. Enum.GetNames<DesignLinkDiagnosticCode>().Select(name => char.ToLowerInvariant(name[0]) + name[1..]).Order(StringComparer.Ordinal)]);

    [Fact]
    void should_link_what_the_corpus_expects_for_every_case()
    {
        var mismatches = _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual)).Select(result => $"{result.Name}: expected {result.Expected.ToJsonString()} but was {result.Actual.ToJsonString()}").ToList();
        mismatches.ShouldBeEmpty();
    }
}
