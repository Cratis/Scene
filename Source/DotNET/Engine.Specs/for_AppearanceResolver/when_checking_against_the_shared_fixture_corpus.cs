// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles.for_AppearanceResolver;

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

        var corpus = JsonNode.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "profile-appearance-fixtures.json")))!;
        _results = [.. corpus["cases"]!.AsArray().Select(item =>
        {
            var theme = item!["theme"].Deserialize<Theme>(_options);
            var appearance = item["appearance"].Deserialize<ProfileAppearance>(_options);
            var fonts = item["availableFonts"].Deserialize<List<string>>(_options);
            var resolved = AppearanceResolver.Resolve(theme, appearance, item["systemIsDark"]!.GetValue<bool>(), fonts);
            var actual = JsonSerializer.SerializeToNode(resolved, _options)!;
            actual.AsObject().Remove("fontStylesheet");
            if (resolved.FontStylesheet is not null)
            {
                actual["fontStylesheet"] = resolved.FontStylesheet;
            }

            foreach (var diagnostic in actual["diagnostics"]!.AsArray())
            {
                var code = diagnostic!["code"]!.GetValue<string>();
                diagnostic["code"] = char.ToLowerInvariant(code[0]) + code[1..];
            }

            return (item["name"]!.GetValue<string>(), item["expected"]!.DeepClone(), actual);
        })];
        _coveredCodes = [.. _results.SelectMany(result => result.Expected["diagnostics"]!.AsArray().Select(diagnostic => diagnostic!["code"]!.GetValue<string>())).Distinct().Order(StringComparer.Ordinal)];
    }

    [Fact]
    void should_have_cases_in_the_corpus() => _results.Count.ShouldBeGreaterThan(15);

    [Fact]
    void should_cover_every_diagnostic_code() => _coveredCodes.ShouldEqual(
        [.. Enum.GetNames<AppearanceDiagnosticCode>().Select(name => char.ToLowerInvariant(name[0]) + name[1..]).Order(StringComparer.Ordinal)]);

    [Fact]
    void should_resolve_what_the_corpus_expects_for_every_case()
    {
        var mismatches = _results.Where(result => !JsonNode.DeepEquals(result.Expected, result.Actual)).Select(result => $"{result.Name}: expected {result.Expected.ToJsonString()} but was {result.Actual.ToJsonString()}").ToList();
        mismatches.ShouldBeEmpty();
    }
}
