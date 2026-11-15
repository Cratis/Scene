// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Engine.Design.for_DesignContrast;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };

    List<string> _ratioMismatches = null!;
    List<string> _systemMismatches = null!;
    int _ratios;

    void Because()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory.FullName, "design-contrast-fixtures.json")));
        var ratios = corpus["ratios"].AsArray();
        _ratios = ratios.Count;
        _ratioMismatches = [.. ratios.Select(item =>
        {
            var expected = item["expected"]?.GetValue<double>();
            var actual = DesignContrast.Ratio(item["foreground"].GetValue<string>(), item["background"].GetValue<string>());
            return (item, expected, actual);
        }).Where(result => result.expected != result.actual).Select(result => $"{result.item["foreground"]} on {result.item["background"]}: expected {result.expected} but was {result.actual}")];

        _systemMismatches = [.. corpus["systems"].AsArray().Select(item =>
        {
            var designSystem = item["designSystem"].Deserialize<DesignSystem>(_options);
            var actual = JsonSerializer.SerializeToNode(DesignContrast.Measure(designSystem!), _options);
            return (Name: item["name"].GetValue<string>(), Expected: item["expected"].DeepClone(), Actual: actual);
        }).Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual)).Select(result => $"{result.Name}: expected {result.Expected.ToJsonString()} but was {result.Actual?.ToJsonString()}")];
    }

    [Fact] void should_have_cases_in_the_corpus() => _ratios.ShouldBeGreaterThan(5);
    [Fact] void should_measure_every_ratio_the_corpus_expects() => _ratioMismatches.ShouldBeEmpty();
    [Fact] void should_find_what_the_corpus_expects_in_every_design_system() => _systemMismatches.ShouldBeEmpty();
}
