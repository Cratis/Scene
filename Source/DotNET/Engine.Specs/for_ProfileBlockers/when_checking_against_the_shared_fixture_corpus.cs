// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Shell;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles.for_ProfileBlockers;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    static readonly JsonSerializerOptions _camelCase = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    TemplateLibrary _library = null!;
    List<ScenePackage> _packages = null!;
    List<BlockerCase> _cases = null!;
    JsonArray _contrastCorpus = null!;
    List<(BlockerCase Case, string Actual)> _results = null!;
    List<(string Name, JsonNode? Expected, JsonNode? Actual)> _fixes = null!;
    List<(string Color, JsonNode? Expected, JsonNode? Actual)> _contrasts = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "profile-blockers-fixtures.json")));
        _library = document.RootElement.GetProperty("libraries").GetProperty("default").Deserialize<TemplateLibrary>(_options)!;
        _packages = document.RootElement.GetProperty("packages").Deserialize<List<ScenePackage>>(_options)!;
        _contrastCorpus = JsonNode.Parse(document.RootElement.GetProperty("contrast").GetRawText())!.AsArray();
        _cases = [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(element => new BlockerCase(
            element.GetProperty("name").GetString()!,
            element.GetProperty("profile").Deserialize<UiProfile>(_options)!,
            element.GetProperty("theme").ValueKind == JsonValueKind.Null ? null : element.GetProperty("theme").Deserialize<Theme>(_options),
            element.GetProperty("usages").Deserialize<List<ProfileUsage>>(_options)!,
            string.Join('\n', element.GetProperty("expected").EnumerateArray().Select(item =>
                $"{item.GetProperty("code").GetString()}|{item.GetProperty("subject").GetString()}|{item.GetProperty("message").GetString()}|{(item.GetProperty("shellCode").ValueKind == JsonValueKind.Null ? string.Empty : item.GetProperty("shellCode").GetString())}|{item.GetProperty("severity").GetString()}|{item.GetProperty("section").GetString()}|{FixText(item.GetProperty("fix"))}")),
            element.TryGetProperty("fixed", out var fixedProfile) ? JsonNode.Parse(fixedProfile.GetRawText()) : null))];
    }

    void Because()
    {
        var problems = new List<(BlockerCase Case, IReadOnlyList<ProfileBlocker> Found)>();
        foreach (var fixture in _cases)
        {
            var shell = ShellResolver.Resolve(fixture.Profile, new ShellResolutionContext(_library));
            problems.Add((fixture, ProfileBlockers.FindProblems(fixture.Profile, new ProfileBlockerContext(_packages, _library, fixture.Theme, shell, fixture.Usages))));
        }

        _results = [.. problems.Select(item => (item.Case, string.Join('\n', item.Found.Select(blocker =>
            $"{ToCamelCase(blocker.Code.ToString())}|{blocker.Subject}|{blocker.Message}|{(blocker.ShellCode is null ? string.Empty : ToCamelCase(blocker.ShellCode.Value.ToString()))}|{ToCamelCase(blocker.Severity.ToString())}|{ToCamelCase(blocker.Section.ToString())}|{FixText(blocker.Fix)}"))))];

        _fixes = [.. problems.Where(item => item.Case.Fixed is not null).Select(item =>
        {
            var fix = item.Found.First(blocker => blocker.Fix is not null).Fix!;
            var fixedProfile = ProfileBlockers.ApplyFix(item.Case.Profile, fix, _packages);
            return (item.Case.Name, item.Case.Fixed, JsonNode.Parse(UiProfileJson.Serialize(fixedProfile)));
        })];

        _contrasts = [.. _contrastCorpus.Select(item => (item!["color"]!.GetValue<string>(), item["expected"], JsonSerializer.SerializeToNode(Contrast.AgainstWhite(item["color"]!.GetValue<string>()), _camelCase)))];
    }

    [Fact]
    void should_have_cases_in_the_corpus() => _cases.Count.ShouldBeGreaterThan(15);

    [Fact]
    void should_cover_every_blocker_code()
    {
        var covered = _cases.SelectMany(fixture => fixture.Expected.Split('\n')).Where(line => line.Length > 0).Select(line => line.Split('|')[0]).Distinct().Order();
        covered.ShouldContainOnly(Enum.GetNames<ProfileBlockerCode>().Select(ToCamelCase).Order());
    }

    [Fact]
    void should_find_the_same_problems_in_the_same_order_as_the_typescript_engine()
    {
        foreach (var (fixture, actual) in _results)
        {
            (fixture.Name, actual).ShouldEqual((fixture.Name, fixture.Expected));
        }
    }

    [Fact]
    void should_give_the_same_profile_as_the_typescript_engine_when_a_fix_is_applied()
    {
        _fixes.Count.ShouldBeGreaterThan(4);
        _fixes.Where(item => !JsonNode.DeepEquals(item.Expected, item.Actual)).Select(item => $"{item.Name}: expected {item.Expected?.ToJsonString()} but was {item.Actual?.ToJsonString()}").ShouldBeEmpty();
    }

    [Fact]
    void should_measure_contrast_like_the_typescript_engine() =>
        _contrasts.Where(item => !JsonNode.DeepEquals(item.Expected, item.Actual)).Select(item => $"{item.Color}: expected {item.Expected?.ToJsonString()} but was {item.Actual?.ToJsonString()}").ShouldBeEmpty();

    [Fact]
    void should_never_leave_a_placeholder_in_a_message()
    {
        var offending = _results.SelectMany(item => item.Actual.Split('\n')).Where(line => line.Contains('{', StringComparison.Ordinal) || line.Contains("null", StringComparison.Ordinal));
        offending.ShouldBeEmpty();
    }

    static string FixText(JsonElement fix) =>
        fix.ValueKind == JsonValueKind.Null
            ? string.Empty
            : $"{fix.GetProperty("kind").GetString()}:{fix.GetProperty("label").GetString()}:{(fix.TryGetProperty("package", out var package) ? package.GetString() : string.Empty)}";

    static string FixText(ProfileFix? fix) =>
        fix is null ? string.Empty : $"{ToCamelCase(fix.Kind.ToString())}:{fix.Label}:{fix.Package}";

    static string ToCamelCase(string value) => char.ToLowerInvariant(value[0]) + value[1..];

    sealed record BlockerCase(string Name, UiProfile Profile, Theme? Theme, List<ProfileUsage> Usages, string Expected, JsonNode? Fixed);
}
