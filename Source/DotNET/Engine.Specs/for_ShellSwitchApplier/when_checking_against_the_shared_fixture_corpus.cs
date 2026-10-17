// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Shell;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_ShellSwitchApplier;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    TemplateLibrary _library = null!;
    List<ApplyCase> _cases = null!;
    List<(ApplyCase Case, ShellSwitchApplication Result)> _results = null!;

    void Establish()
    {
        _library = Fixture("shell-switch-fixtures.json").RootElement.GetProperty("libraries").GetProperty("default").Deserialize<TemplateLibrary>(_options)!;
        _cases = [.. Fixture("shell-switch-apply-fixtures.json").RootElement.GetProperty("cases").EnumerateArray().Select(element =>
        {
            var document = element.GetProperty("document");
            return new ApplyCase(
                element.GetProperty("name").GetString()!,
                JsonSerializer.Deserialize<UiProfile>(element.GetProperty("profile").GetRawText(), _options)!,
                element.GetProperty("currentRoot").Deserialize<TemplateReference>(_options)!,
                element.GetProperty("candidateRoot").Deserialize<TemplateReference>(_options)!,
                RemapsOf(element.GetProperty("remaps")),
                [.. document.GetProperty("screens").EnumerateArray().Select(ScreenOf)],
                [.. document.GetProperty("screenTemplates").EnumerateArray().Select(TemplateOf)],
                element.GetProperty("expected"));
        })];
    }

    void Because() => _results = [.. _cases.Select(fixture => (fixture, Apply(fixture)))];

    [Fact]
    void should_have_cases_in_the_corpus() => _cases.Count.ShouldBeGreaterThan(10);

    [Fact]
    void should_give_the_same_documents_and_changes_as_the_typescript_engine()
    {
        foreach (var (fixture, result) in _results)
        {
            (fixture.Name, Describe(result)).ShouldEqual((fixture.Name, DescribeExpected(fixture.Expected)));
        }
    }

    [Fact]
    void should_never_leave_a_placeholder_or_an_id_in_a_message()
    {
        var messages = _results.SelectMany(item => item.Result.Changes.Select(change => change.Description));
        messages.Where(message => message.Contains('{', StringComparison.Ordinal) || message.Contains("undefined", StringComparison.Ordinal) || message.Contains("null", StringComparison.Ordinal)).ShouldBeEmpty();
    }

    [Fact]
    void should_give_the_same_result_twice()
    {
        foreach (var (fixture, result) in _results)
        {
            (fixture.Name, Describe(Apply(fixture))).ShouldEqual((fixture.Name, Describe(result)));
        }
    }

    [Fact]
    void should_hand_back_the_very_screens_and_templates_when_nothing_changed()
    {
        foreach (var (fixture, result) in _results.Where(item => item.Result.Changes.Count == 0))
        {
            (fixture.Name, ReferenceEquals(result.Screens, fixture.Screens) && ReferenceEquals(result.ScreenTemplates, fixture.Templates)).ShouldEqual((fixture.Name, true));
        }
    }

    [Fact]
    void should_keep_every_element_exactly_once_unless_dropped()
    {
        foreach (var (fixture, result) in _results)
        {
            var before = fixture.Screens.Sum(screen => screen.SlotContent.Values.Sum(content => content.Count));
            var after = result.Screens.Sum(screen => screen.SlotContent.Values.Sum(content => content.Count));
            var dropped = result.Changes.Where(change => change.Kind == ShellSwitchChangeKind.Content && change.Target is null).Sum(change => change.Count);
            (fixture.Name, before - after).ShouldEqual((fixture.Name, dropped));
        }
    }

    static JsonDocument Fixture(string name)
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, name)));
    }

    static Screen ScreenOf(JsonElement element) => new(
        element.GetProperty("name").GetString()!,
        element.GetProperty("layout").GetString()!,
        element.GetProperty("slotContent").EnumerateObject().ToDictionary(
            slot => slot.Name,
            slot => (IReadOnlyList<SceneElement>)[.. slot.Value.EnumerateArray().Select(item => (SceneElement)new ExternalComponent { Id = item.GetProperty("id").GetString()!, Name = item.GetProperty("id").GetString()!, ComponentName = item.GetProperty("type").GetString()! })],
            StringComparer.Ordinal),
        [],
        [],
        element.TryGetProperty("screenTemplate", out var template) ? template.GetString() : null);

    static ScreenTemplate TemplateOf(JsonElement element) => new(
        element.GetProperty("name").GetString()!,
        element.TryGetProperty("fitsSlot", out var fits) ? fits.GetString() : null,
        [.. element.GetProperty("slots").EnumerateArray().Select(slot => new Slot(slot.GetProperty("name").GetString()!))]);

    static Dictionary<string, OutletRemap> RemapsOf(JsonElement element) =>
        element.EnumerateObject().ToDictionary(
            property => property.Name,
            property => new OutletRemap(
                Enum.Parse<ShellOutletAction>(property.Value.GetProperty("action").GetString()!, ignoreCase: true),
                property.Value.TryGetProperty("target", out var target) ? target.GetString() : null),
            StringComparer.Ordinal);

    static string ToCamelCase(string value) => char.ToLowerInvariant(value[0]) + value[1..];

    static string Describe(ShellSwitchApplication result) => string.Join('\n', Lines(
        result.Applied,
        result.Screens.Select(screen => (screen.Name, screen.ScreenTemplate, string.Join(';', screen.SlotContent.Select(slot => $"{slot.Key}=[{string.Join(',', slot.Value.Select(element => element.Id))}]")))),
        result.ScreenTemplates.Select(template => (template.Name, template.FitsSlot)),
        result.Changes.Select(change => (ToCamelCase(change.Kind.ToString()), change.Screen, change.Template, change.Outlet, ToCamelCase(change.Action.ToString()), change.Target, change.Count, change.Description))));

    static string DescribeExpected(JsonElement expected) => string.Join('\n', Lines(
        expected.GetProperty("applied").GetBoolean(),
        expected.GetProperty("screens").EnumerateArray().Select(screen => (
            screen.GetProperty("name").GetString()!,
            screen.TryGetProperty("screenTemplate", out var template) ? template.GetString() : null,
            string.Join(';', screen.GetProperty("slotContent").EnumerateObject().Select(slot => $"{slot.Name}=[{string.Join(',', slot.Value.EnumerateArray().Select(id => id.GetString()))}]")))),
        expected.GetProperty("screenTemplates").EnumerateArray().Select(template => (template.GetProperty("name").GetString()!, template.TryGetProperty("fitsSlot", out var fits) ? fits.GetString() : null)),
        expected.GetProperty("changes").EnumerateArray().Select(change => (
            change.GetProperty("kind").GetString()!,
            change.TryGetProperty("screen", out var screen) ? screen.GetString() : null,
            change.TryGetProperty("template", out var template) ? template.GetString() : null,
            change.GetProperty("outlet").GetString()!,
            change.GetProperty("action").GetString()!,
            change.TryGetProperty("target", out var target) ? target.GetString() : null,
            change.GetProperty("count").GetInt32(),
            change.GetProperty("description").GetString()!))));

    static IEnumerable<string> Lines(
        bool applied,
        IEnumerable<(string Name, string? Template, string Content)> screens,
        IEnumerable<(string Name, string? FitsSlot)> templates,
        IEnumerable<(string Kind, string? Screen, string? Template, string Outlet, string Action, string? Target, int Count, string Description)> changes)
    {
        yield return $"applied {applied}";
        foreach (var screen in screens)
        {
            yield return $"screen {screen.Name}|{screen.Template}|{screen.Content}";
        }

        foreach (var template in templates)
        {
            yield return $"template {template.Name}|{template.FitsSlot}";
        }

        foreach (var change in changes)
        {
            yield return $"change {change.Kind}|{change.Screen}|{change.Template}|{change.Outlet}|{change.Action}|{change.Target}|{change.Count}|{change.Description}";
        }
    }

    ShellSwitchApplication Apply(ApplyCase fixture)
    {
        var context = new ShellResolutionContext(_library);
        var current = ShellResolver.Resolve(fixture.Profile with { Root = new RootTemplate(fixture.CurrentRoot) }, context);
        var candidate = ShellResolver.Resolve(fixture.Profile with { Root = new RootTemplate(fixture.CandidateRoot) }, context);
        var templates = ShellPlacement.PlaceableScreenTemplates(fixture.Profile, context);
        var plan = ShellSwitchPlanner.Plan(current, candidate, fixture.Screens, templates, fixture.Remaps);
        return ShellSwitchApplier.Apply(fixture.Screens, fixture.Templates, plan, templates);
    }

    sealed record ApplyCase(string Name, UiProfile Profile, TemplateReference CurrentRoot, TemplateReference CandidateRoot, Dictionary<string, OutletRemap> Remaps, List<Screen> Screens, List<ScreenTemplate> Templates, JsonElement Expected);
}
