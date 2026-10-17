// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles.for_PackageList;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    static readonly JsonSerializerOptions _readOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    static readonly JsonSerializerOptions _templateOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };

    List<ScenePackage> _packages = null!;
    JsonArray _cases = null!;
    List<(string Name, JsonNode Expected, JsonNode Actual)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "package-list-fixtures.json")))!;
        _packages = corpus["packages"].Deserialize<List<ScenePackage>>(_readOptions)!;
        _cases = corpus["cases"]!.AsArray();
    }

    void Because() => _results = [.. _cases.Select(item =>
    {
        var profile = item!["profile"].Deserialize<UiProfile>(_readOptions)!;
        var action = item["action"]!;
        var kind = action["kind"]!.GetValue<string>();
        var expected = item["expected"]!;
        JsonNode actual;
        if (kind == "describe")
        {
            var listing = PackageList.Describe(profile, _packages);
            actual = new JsonObject { ["rows"] = JsonSerializer.SerializeToNode(listing.Rows, _options), ["addable"] = JsonSerializer.SerializeToNode(listing.Addable, _options) };
            foreach (var entry in actual["rows"]!.AsArray().Concat(actual["addable"]!.AsArray()))
            {
                // The package kind is the model's enum, written PascalCase like everywhere else in a profile or package; the engine's own enums are camelCase.
                var packageKind = entry!["kind"]!.GetValue<string>();
                entry["kind"] = char.ToUpperInvariant(packageKind[0]) + packageKind[1..];
            }

            if (expected["suppliers"] is not null)
            {
                actual["suppliers"] = JsonSerializer.SerializeToNode(listing.Suppliers, _options);
            }
        }
        else
        {
            var name = action["name"]?.GetValue<string>() ?? string.Empty;
            var edit = kind switch
            {
                "add" => PackageList.Add(profile, _packages, name),
                "remove" => PackageList.Remove(profile, _packages, name),
                "move" => PackageList.Move(profile, _packages, name, action["direction"]!.GetValue<string>() == "up" ? MoveDirection.Up : MoveDirection.Down),
                "blueprint" => PackageList.ChooseBlueprint(profile, _packages, action["blueprint"]!.GetValue<string>(), action["shell"]?.GetValue<string>()),
                _ => PackageList.ChooseTheme(profile, _packages, action["theme"]!.GetValue<string>())
            };
            var result = new JsonObject
            {
                ["outcome"] = JsonSerializer.SerializeToNode(edit.Outcome, _options),
                ["packages"] = JsonSerializer.SerializeToNode(edit.Profile.Packages, _options),
                ["added"] = JsonSerializer.SerializeToNode(edit.Added, _options),
                ["removed"] = JsonSerializer.SerializeToNode(edit.Removed, _options),
                ["message"] = edit.Message
            };
            if (edit.Profile.Root is not null)
            {
                result["root"] = JsonNode.Parse(JsonSerializer.Serialize(edit.Profile.Root.Template, _templateOptions));
            }

            if (edit.Profile.Theme is not null)
            {
                result["theme"] = edit.Profile.Theme;
            }

            actual = result;
        }

        return (item["name"]!.GetValue<string>(), expected.DeepClone(), actual);
    })];

    [Fact]
    void should_have_cases_in_the_corpus() => _results.Count.ShouldBeGreaterThan(25);

    [Fact]
    void should_answer_what_the_corpus_expects_for_every_case()
    {
        var mismatches = _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual)).Select(result => $"{result.Name}: expected {result.Expected.ToJsonString()} but was {result.Actual.ToJsonString()}").ToList();
        mismatches.ShouldBeEmpty();
    }
}
