// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles.for_ProfilePickers;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _read = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    static readonly JsonSerializerOptions _write = new()
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

        _corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "profile-pickers-fixtures.json")))!;
    }

    void Because()
    {
        var themes = _corpus["themes"].Deserialize<List<Theme>>(_read)!;
        var packages = _corpus["packages"].Deserialize<List<ScenePackage>>(_read)!;
        _results = [];

        foreach (var item in _corpus["themeCards"]!.AsArray())
        {
            var profile = item!["profile"].Deserialize<UiProfile>(_read)!;
            var scheme = item["scheme"] is null ? (ColorScheme?)null : Enum.Parse<ColorScheme>(item["scheme"]!.GetValue<string>());
            _results.Add(($"theme cards: {item["name"]}", item["expected"], JsonSerializer.SerializeToNode(ThemeCards.Describe(profile, themes, packages, scheme), _write)));
        }

        foreach (var item in _corpus["colorSchemeSwitch"]!.AsArray())
        {
            var profile = item!["profile"].Deserialize<UiProfile>(_read)!;
            var edit = ThemeCards.SwitchColorScheme(profile, Enum.Parse<ColorScheme>(item["scheme"]!.GetValue<string>()), themes);
            var actual = new JsonObject { ["profile"] = JsonNode.Parse(UiProfileJson.Serialize(edit.Profile)), ["themeChanged"] = edit.ThemeChanged, ["message"] = edit.Message };
            _results.Add(($"colour scheme: {item["name"]}", item["expected"], actual));
        }

        foreach (var item in _corpus["versionRules"]!.AsArray())
        {
            var rule = VersionRules.Describe(item!["pin"]?.GetValue<string>(), item["installed"]!.GetValue<string>(), item["latest"]?.GetValue<string>());
            _results.Add(($"version rule: {item["name"]}", item["expected"], JsonSerializer.SerializeToNode(rule, _write)));
        }

        foreach (var item in _corpus["ownShell"]!.AsArray())
        {
            _results.Add(($"own shell: {item!["value"]}", item["expected"], JsonSerializer.SerializeToNode(OwnShells.Describe(item["value"]!.GetValue<string>()), _write)));
        }

        foreach (var item in _corpus["shellCards"]!.AsArray())
        {
            var library = item!["library"].Deserialize<TemplateLibrary>(_read)!;
            _results.Add(($"shell cards: {item["name"]}", item["expected"], JsonSerializer.SerializeToNode(ShellCards.Describe(library), _write)));
        }
    }

    [Fact] void should_have_cases() => _results.Count.ShouldBeGreaterThan(30);

    [Fact]
    void should_answer_what_the_corpus_expects() =>
        _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual))
            .Select(result => $"{result.Name}: expected {result.Expected?.ToJsonString()} but was {result.Actual?.ToJsonString()}")
            .ShouldBeEmpty();
}
