// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
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

    TemplateLibrary _library = null!;
    List<ScenePackage> _packages = null!;
    List<BlockerCase> _cases = null!;
    List<(BlockerCase Case, string Actual)> _results = null!;

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
        _cases = [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(element => new BlockerCase(
            element.GetProperty("name").GetString()!,
            element.GetProperty("profile").Deserialize<UiProfile>(_options)!,
            element.GetProperty("theme").ValueKind == JsonValueKind.Null ? null : element.GetProperty("theme").Deserialize<Theme>(_options),
            element.GetProperty("usages").Deserialize<List<ProfileUsage>>(_options)!,
            string.Join('\n', element.GetProperty("expected").EnumerateArray().Select(item =>
                $"{item.GetProperty("code").GetString()}|{item.GetProperty("subject").GetString()}|{item.GetProperty("message").GetString()}|{(item.GetProperty("shellCode").ValueKind == JsonValueKind.Null ? string.Empty : item.GetProperty("shellCode").GetString())}"))))];
    }

    void Because() => _results = [.. _cases.Select(fixture =>
    {
        var shell = ShellResolver.Resolve(fixture.Profile, new ShellResolutionContext(_library));
        var blockers = ProfileBlockers.Find(fixture.Profile, new ProfileBlockerContext(_packages, _library, fixture.Theme, shell, fixture.Usages));
        return (fixture, string.Join('\n', blockers.Select(item =>
            $"{ToCamelCase(item.Code.ToString())}|{item.Subject}|{item.Message}|{(item.ShellCode is null ? string.Empty : ToCamelCase(item.ShellCode.Value.ToString()))}")));
    })];

    [Fact]
    void should_have_cases_in_the_corpus() => _cases.Count.ShouldBeGreaterThan(15);

    [Fact]
    void should_cover_every_blocker_code()
    {
        var covered = _cases.SelectMany(fixture => fixture.Expected.Split('\n')).Where(line => line.Length > 0).Select(line => line.Split('|')[0]).Distinct().Order();
        covered.ShouldContainOnly(Enum.GetNames<ProfileBlockerCode>().Select(ToCamelCase).Order());
    }

    [Fact]
    void should_find_the_same_blockers_in_the_same_order_as_the_typescript_engine()
    {
        foreach (var (fixture, actual) in _results)
        {
            (fixture.Name, actual).ShouldEqual((fixture.Name, fixture.Expected));
        }
    }

    [Fact]
    void should_never_leave_a_placeholder_in_a_message()
    {
        var offending = _results.SelectMany(item => item.Actual.Split('\n')).Where(line => line.Contains('{', StringComparison.Ordinal) || line.Contains("null", StringComparison.Ordinal));
        offending.ShouldBeEmpty();
    }

    static string ToCamelCase(string value) => char.ToLowerInvariant(value[0]) + value[1..];

    sealed record BlockerCase(string Name, UiProfile Profile, Theme? Theme, List<ProfileUsage> Usages, string Expected);
}
