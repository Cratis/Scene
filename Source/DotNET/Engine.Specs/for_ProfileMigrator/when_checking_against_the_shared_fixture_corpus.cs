// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Templates;

namespace Cratis.Scene.Engine.Profiles.for_ProfileMigrator;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    TemplateLibrary _library = null!;
    List<MigrationCase> _cases = null!;
    List<(MigrationCase Case, ProfileMigration Result)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "profile-migration-fixtures.json")));
        _library = document.RootElement.GetProperty("library").Deserialize<TemplateLibrary>(_options)!;
        _cases = [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(element =>
        {
            var legacy = element.GetProperty("legacy");
            var expected = element.GetProperty("expected");
            return new MigrationCase(
                element.GetProperty("name").GetString()!,
                new LegacyProfile(
                    UiProfileJson.Parse(legacy.GetProperty("profile")),
                    Optional(legacy, "shell"),
                    Optional(legacy, "layout"),
                    Optional(legacy, "navigationMode"),
                    Optional(legacy, "colorScheme"),
                    Optional(legacy, "accent"),
                    Optional(legacy, "defaultScreenTemplate")),
                expected.GetProperty("profile").GetString()!,
                expected.GetProperty("changed").GetBoolean(),
                [.. expected.GetProperty("diagnostics").EnumerateArray().Select(item =>
                    $"{item.GetProperty("code").GetString()}|{(item.GetProperty("subject").ValueKind == JsonValueKind.Null ? string.Empty : item.GetProperty("subject").GetString())}|{item.GetProperty("message").GetString()}")]);
        })];
    }

    void Because() => _results = [.. _cases.Select(fixture => (fixture, ProfileMigrator.Migrate(fixture.Legacy, _library)))];

    [Fact]
    void should_have_a_case_for_every_legacy_permutation() => _cases.Count.ShouldBeGreaterThan(25);

    [Fact]
    void should_cover_every_diagnostic_code()
    {
        var covered = _cases.SelectMany(fixture => fixture.Diagnostics).Select(line => line.Split('|')[0]).Distinct().Order();
        covered.ShouldContainOnly(Enum.GetNames<ProfileMigrationDiagnosticCode>().Select(ToCamelCase).Order());
    }

    [Fact]
    void should_give_the_profile_in_the_new_shape_like_the_typescript_engine()
    {
        foreach (var (fixture, result) in _results)
        {
            (fixture.Name, UiProfileJson.Serialize(result.Profile)).ShouldEqual((fixture.Name, fixture.Profile));
        }
    }

    [Fact]
    void should_say_whether_it_changed_like_the_typescript_engine()
    {
        foreach (var (fixture, result) in _results)
        {
            (fixture.Name, result.Changed).ShouldEqual((fixture.Name, fixture.Changed));
        }
    }

    [Fact]
    void should_report_what_it_could_not_map_like_the_typescript_engine()
    {
        foreach (var (fixture, result) in _results)
        {
            (fixture.Name, Describe(result)).ShouldEqual((fixture.Name, string.Join('\n', fixture.Diagnostics)));
        }
    }

    [Fact]
    void should_leave_a_migrated_profile_alone_with_the_legacy_fields_next_to_it()
    {
        foreach (var (fixture, result) in _results)
        {
            var again = ProfileMigrator.Migrate(fixture.Legacy with { Profile = result.Profile }, _library);
            (fixture.Name, UiProfileJson.Serialize(again.Profile), again.Changed).ShouldEqual((fixture.Name, fixture.Profile, false));
        }
    }

    [Fact]
    void should_leave_a_migrated_profile_alone_without_them()
    {
        foreach (var (fixture, result) in _results)
        {
            var again = ProfileMigrator.Migrate(new LegacyProfile(result.Profile), _library);
            (fixture.Name, UiProfileJson.Serialize(again.Profile)).ShouldEqual((fixture.Name, fixture.Profile));
        }
    }

    [Fact]
    void should_never_leave_a_placeholder_in_a_message()
    {
        var offending = _results.SelectMany(item => item.Result.Diagnostics).Where(diagnostic => diagnostic.Message.Contains('{', StringComparison.Ordinal) || diagnostic.Message.Contains("null", StringComparison.Ordinal));
        offending.ShouldBeEmpty();
    }

    static string Describe(ProfileMigration result) =>
        string.Join('\n', result.Diagnostics.Select(item => $"{ToCamelCase(item.Code.ToString())}|{item.Subject}|{item.Message}"));

    static string? Optional(JsonElement element, string name) => element.TryGetProperty(name, out var value) ? value.GetString() : null;

    static string ToCamelCase(string value) => char.ToLowerInvariant(value[0]) + value[1..];

    record MigrationCase(string Name, LegacyProfile Legacy, string Profile, bool Changed, List<string> Diagnostics);
}
