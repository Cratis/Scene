// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Shell;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_ShellResolver;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    Dictionary<string, TemplateLibrary> _libraries = null!;
    List<ShellCase> _cases = null!;
    List<(ShellCase Case, string Actual)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "effective-shell-fixtures.json")));
        _libraries = document.RootElement.GetProperty("libraries").Deserialize<Dictionary<string, TemplateLibrary>>(_options)!;
        _cases = [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(element => new ShellCase(
            element.GetProperty("name").GetString()!,
            element.GetProperty("library").GetString()!,
            JsonSerializer.Deserialize<UiProfile>(element.GetProperty("profile").GetRawText(), _options)!,
            element.TryGetProperty("screens", out var screens) ? screens.Deserialize<List<Screen>>(_options) : null,
            element.TryGetProperty("themes", out var themes) ? themes.Deserialize<List<Theme>>(_options) : null,
            element.TryGetProperty("availablePackages", out var packages) ? packages.Deserialize<List<string>>(_options) : null,
            Describe(element.GetProperty("expected"))))];
    }

    void Because() => _results = [.. _cases.Select(fixture =>
    {
        var shell = ShellResolver.Resolve(fixture.Profile, new ShellResolutionContext(_libraries[fixture.Library], fixture.Screens, fixture.Themes, fixture.AvailablePackages));
        return (fixture, Describe(shell));
    })];

    [Fact]
    void should_have_cases_in_the_corpus() => _cases.Count.ShouldBeGreaterThan(25);

    [Fact]
    void should_cover_every_diagnostic_code()
    {
        var covered = _cases.SelectMany(fixture => fixture.Expected.Split('\n')).Where(line => line.StartsWith("diagnostic ", StringComparison.Ordinal))
            .Select(line => line.Split('|')[0]["diagnostic ".Length..]).Distinct().Order();
        covered.ShouldContainOnly(Enum.GetNames<ShellDiagnosticCode>().Select(ToCamelCase).Order());
    }

    [Fact]
    void should_resolve_like_the_typescript_engine()
    {
        foreach (var (fixture, actual) in _results)
        {
            (fixture.Name, actual).ShouldEqual((fixture.Name, fixture.Expected));
        }
    }

    static string Describe(JsonElement expected)
    {
        var lines = new List<string>
        {
            $"origin {expected.GetProperty("origin").GetString()}",
            $"kind {expected.GetProperty("kind").GetString()}",
            $"source {expected.GetProperty("source").GetString()}",
            $"name {expected.GetProperty("name").GetString()}",
            $"reference {(expected.TryGetProperty("reference", out var reference) ? Reference(reference.GetProperty("source").GetString()!, reference.GetProperty("id").GetString()!, Optional(reference, "blueprint"), Optional(reference, "version")) : string.Empty)}",
            $"package {Optional(expected, "package")} {Optional(expected, "packageVersion")}",
            $"pin {Optional(expected, "pinStatus")} {Optional(expected, "pin")}",
            $"outlets {string.Join(",", expected.GetProperty("outlets").EnumerateArray().Select(item => item.GetString()))}",
            $"primary {expected.GetProperty("primaryOutlet").GetString()}",
            $"options {string.Join(",", expected.GetProperty("options").EnumerateObject().OrderBy(property => property.Name, StringComparer.Ordinal).Select(property => $"{property.Name}={property.Value.GetRawText()}"))}"
        };
        lines.AddRange(expected.GetProperty("diagnostics").EnumerateArray().Select(item => $"diagnostic {item.GetProperty("code").GetString()}|{(item.GetProperty("subject").ValueKind == JsonValueKind.Null ? string.Empty : item.GetProperty("subject").GetString())}|{item.GetProperty("message").GetString()}"));
        return string.Join('\n', lines);
    }

    static string Describe(EffectiveShell shell)
    {
        var lines = new List<string>
        {
            $"origin {ToCamelCase(shell.Origin.ToString())}",
            $"kind {ToCamelCase(shell.Kind.ToString())}",
            $"source {ToCamelCase(shell.Source.ToString())}",
            $"name {shell.Name}",
            $"reference {(shell.Reference is null ? string.Empty : Reference(shell.Reference.Source.ToString(), shell.Reference.Id, shell.Reference.Blueprint ?? string.Empty, shell.Reference.Version ?? string.Empty))}",
            $"package {shell.Package} {shell.PackageVersion}",
            $"pin {(shell.Pin is null ? string.Empty : shell.Pin.Status.ToString())} {shell.Pin?.Pin}",
            $"outlets {string.Join(",", shell.Outlets)}",
            $"primary {shell.PrimaryOutlet}",
            $"options {string.Join(",", shell.Options.OrderBy(option => option.Key, StringComparer.Ordinal).Select(option => $"{option.Key}={option.Value?.ToJsonString() ?? "null"}"))}"
        };
        lines.AddRange(shell.Diagnostics.Select(item => $"diagnostic {ToCamelCase(item.Code.ToString())}|{item.Subject}|{item.Message}"));
        return string.Join('\n', lines);
    }

    static string Reference(string source, string id, string blueprint, string version) => $"{source}:{id}:{blueprint}:{version}";

    static string Optional(JsonElement element, string name) => element.TryGetProperty(name, out var value) ? value.GetString() ?? string.Empty : string.Empty;

    static string ToCamelCase(string value) => char.ToLowerInvariant(value[0]) + value[1..];

    record ShellCase(string Name, string Library, UiProfile Profile, List<Screen>? Screens, List<Theme>? Themes, List<string>? AvailablePackages, string Expected);
}
