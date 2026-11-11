// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles.for_ProfileBlockers;

public class when_fixing_sparse_profiles_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    List<(string Name, UiProfile Profile, ProfileFix Fix, JsonNode? Expected)> _cases = null!;
    List<(string Name, JsonNode? Expected, JsonNode? Actual)> _results = null!;
    IReadOnlyList<ProfileBlocker> _problemsWithNothingToCheck = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "profile-blockers-fixtures.json")));
        _cases =
        [
            .. document.RootElement.GetProperty("fixEdgeCases").EnumerateArray().Select(element => (
                element.GetProperty("name").GetString()!,
                element.GetProperty("profile").Deserialize<UiProfile>(_options)!,
                element.GetProperty("fix").Deserialize<ProfileFix>(_options)!,
                JsonNode.Parse(element.GetProperty("expected").GetRawText())))
        ];
    }

    void Because()
    {
        _results = [.. _cases.Select(item => (item.Name, item.Expected, JsonNode.Parse(UiProfileJson.Serialize(ProfileBlockers.ApplyFix(item.Profile, item.Fix, [])))))];
        _problemsWithNothingToCheck = ProfileBlockers.FindProblems(_cases[0].Profile, new ProfileBlockerContext([], new TemplateLibrary(null, [])));
    }

    [Fact]
    void should_give_the_profile_the_corpus_expects_for_every_sparse_fix() =>
        _results.Where(item => !JsonNode.DeepEquals(item.Expected, item.Actual)).Select(item => $"{item.Name}: expected {item.Expected?.ToJsonString()} but was {item.Actual?.ToJsonString()}").ShouldBeEmpty();

    [Fact]
    void should_cover_every_fix_kind() => _cases.Select(item => item.Fix.Kind).Distinct().Count().ShouldEqual(Enum.GetValues<ProfileFixKind>().Length);

    [Fact]
    void should_find_no_problems_when_there_is_no_shell_theme_usage_or_own_library() => _problemsWithNothingToCheck.ShouldBeEmpty();
}
