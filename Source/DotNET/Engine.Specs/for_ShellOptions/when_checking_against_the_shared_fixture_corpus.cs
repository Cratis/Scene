// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Engine.Profiles.for_ShellOptions;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    JsonNode _corpus = null!;
    List<(string Name, JsonNode? Expected, JsonNode? Actual)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        _corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "shell-options-fixtures.json")))!;
    }

    void Because()
    {
        _results = [];
        _results.Add(("modes", _corpus["modes"], JsonSerializer.SerializeToNode(ShellOptions.NavigationModes, _options)));
        _results.Add(("menuThemes", _corpus["menuThemes"], JsonSerializer.SerializeToNode(ShellOptions.MenuThemes, _options)));

        foreach (var item in _corpus["normalize"]!.AsArray())
        {
            var mode = ShellOptions.Normalize(item!["input"]!.GetValue<string>());
            var actual = mode is null ? null : JsonSerializer.SerializeToNode(mode.Value, _options);
            _results.Add(($"normalize {item["input"]}", item["expected"], actual));
        }

        foreach (var item in _corpus["behavior"]!.AsArray())
        {
            var mode = ShellOptions.Normalize(item!["mode"]!.GetValue<string>())!.Value;
            _results.Add(($"behavior {item["mode"]} {item["touch"]}", item["expected"], JsonSerializer.SerializeToNode(ShellOptions.DescribeBehavior(mode, item["touch"]!.GetValue<bool>()), _options)));
        }

        foreach (var item in _corpus["switch"]!.AsArray())
        {
            var change = ShellOptions.ModeAfterShellSwitch(item!["current"]?.GetValue<string>(), item["shellDefault"]?.GetValue<string>(), item["shellName"]!.GetValue<string>());
            _results.Add(($"switch {item["name"]}", item["expected"], JsonSerializer.SerializeToNode(change, _options)));
        }
    }

    [Fact] void should_have_cases() => _results.Count.ShouldBeGreaterThan(30);

    [Fact]
    void should_answer_what_the_corpus_expects() =>
        _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual))
            .Select(result => $"{result.Name}: expected {result.Expected?.ToJsonString()} but was {result.Actual?.ToJsonString()}")
            .ShouldBeEmpty();
}
