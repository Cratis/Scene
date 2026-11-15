// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Design.for_DesignResolver;

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

        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory.FullName, "design-resolution-fixtures.json")));
        _results = [.. corpus["cases"].AsArray().Select(item =>
        {
            var designSystem = item["designSystem"].Deserialize<DesignSystem>(_options);
            var theme = item["theme"]?.GetValue<string>();
            var packageThemes = item["packageThemes"].Deserialize<List<Theme>>(_options);
            var appearance = item["appearance"].Deserialize<ProfileAppearance>(_options);
            var fonts = item["availableFonts"].Deserialize<List<string>>(_options);
            var resolved = DesignResolver.Resolve(designSystem!, theme, packageThemes, appearance, item["systemIsDark"].GetValue<bool>(), fonts);
            return (item["name"].GetValue<string>(), item["expected"].DeepClone(), Project(resolved));
        })];
        _coveredCodes = [.. _results.SelectMany(result => result.Expected["diagnostics"].AsArray().Select(diagnostic => diagnostic["code"].GetValue<string>())).Distinct().Order(StringComparer.Ordinal)];
    }

    [Fact]
    void should_have_cases_in_the_corpus() => _results.Count.ShouldBeGreaterThan(10);

    [Fact]
    void should_cover_every_diagnostic_code() => _coveredCodes.ShouldEqual(
        [.. Enum.GetNames<DesignDiagnosticCode>().Select(CamelCase).Order(StringComparer.Ordinal)]);

    [Fact]
    void should_resolve_what_the_corpus_expects_for_every_case()
    {
        var mismatches = _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual)).Select(result => $"{result.Name}: expected {result.Expected.ToJsonString()} but was {result.Actual.ToJsonString()}").ToList();
        mismatches.ShouldBeEmpty();
    }

    static string CamelCase(string name) => char.ToLowerInvariant(name[0]) + name[1..];

    static JsonNode Project(ResolvedDesign design)
    {
        var projected = new JsonObject
        {
            ["designSystem"] = design.DesignSystem,
            ["theme"] = design.Theme,
            ["colorScheme"] = design.ColorScheme.ToString(),
            ["tokens"] = JsonSerializer.SerializeToNode(design.Tokens, _options),
            ["components"] = JsonSerializer.SerializeToNode(design.Components, _options),
            ["diagnostics"] = new JsonArray([.. design.Diagnostics.Select(diagnostic => (JsonNode)new JsonObject
            {
                ["code"] = CamelCase(diagnostic.Code.ToString()),
                ["message"] = diagnostic.Message
            })]),
            ["appearanceDiagnostics"] = new JsonArray([.. design.Appearance.Diagnostics.Select(diagnostic => (JsonNode)CamelCase(diagnostic.Code.ToString()))])
        };
        if (design.Mode is not null)
        {
            projected["mode"] = design.Mode;
        }

        return projected;
    }
}
