// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Shell;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_ShellSwitchPlanner;

public class when_checking_against_the_shared_fixture_corpus : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    TemplateLibrary _library = null!;
    List<SwitchCase> _cases = null!;
    List<(SwitchCase Case, ShellSwitchPlan Plan)> _results = null!;

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "shell-switch-fixtures.json")));
        _library = document.RootElement.GetProperty("libraries").GetProperty("default").Deserialize<TemplateLibrary>(_options)!;
        _cases = [.. document.RootElement.GetProperty("cases").EnumerateArray().Select(element => new SwitchCase(
            element.GetProperty("name").GetString()!,
            JsonSerializer.Deserialize<UiProfile>(element.GetProperty("profile").GetRawText(), _options)!,
            element.GetProperty("currentRoot").Deserialize<TemplateReference>(_options)!,
            element.GetProperty("candidateRoot").Deserialize<TemplateReference>(_options)!,
            [.. element.GetProperty("screens").EnumerateArray().Select(ScreenOf)],
            RemapsOf(element.GetProperty("remaps")),
            DescribeExpected(element.GetProperty("expected"))))];
    }

    void Because() => _results = [.. _cases.Select(fixture =>
    {
        var context = new ShellResolutionContext(_library);
        var current = ShellResolver.Resolve(fixture.Profile with { Root = new RootTemplate(fixture.CurrentRoot) }, context);
        var candidate = ShellResolver.Resolve(fixture.Profile with { Root = new RootTemplate(fixture.CandidateRoot) }, context);
        var templates = ShellPlacement.PlaceableScreenTemplates(fixture.Profile, context);
        return (fixture, ShellSwitchPlanner.Plan(current, candidate, fixture.Screens, templates, fixture.Remaps));
    })];

    [Fact]
    void should_have_cases_in_the_corpus() => _cases.Count.ShouldBeGreaterThan(20);

    [Fact]
    void should_cover_every_outlet_action()
    {
        var covered = _results.SelectMany(item => item.Plan.Moves).Select(move => move.Action).Distinct().Order();
        covered.ShouldContainOnly(Enum.GetValues<ShellOutletAction>().Order());
    }

    [Fact]
    void should_give_the_same_plan_as_the_typescript_engine()
    {
        foreach (var (fixture, plan) in _results)
        {
            (fixture.Name, Describe(plan)).ShouldEqual((fixture.Name, fixture.Expected));
        }
    }

    [Fact]
    void should_never_leave_a_placeholder_or_an_id_in_a_message()
    {
        var messages = _results.SelectMany(item => item.Plan.Moves.Select(move => move.Description).Concat(item.Plan.Blockers.Select(b => b.Message)).Concat(item.Plan.Warnings.Select(w => w.Message)));
        messages.Where(message => message.Contains('{', StringComparison.Ordinal) || message.Contains("undefined", StringComparison.Ordinal) || message.Contains("null", StringComparison.Ordinal)).ShouldBeEmpty();
    }

    [Fact]
    void should_be_deterministic()
    {
        foreach (var (fixture, plan) in _results)
        {
            var context = new ShellResolutionContext(_library);
            var current = ShellResolver.Resolve(fixture.Profile with { Root = new RootTemplate(fixture.CurrentRoot) }, context);
            var candidate = ShellResolver.Resolve(fixture.Profile with { Root = new RootTemplate(fixture.CandidateRoot) }, context);
            var again = ShellSwitchPlanner.Plan(current, candidate, fixture.Screens, ShellPlacement.PlaceableScreenTemplates(fixture.Profile, context), fixture.Remaps);
            (fixture.Name, Describe(again)).ShouldEqual((fixture.Name, Describe(plan)));
        }
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

    static Dictionary<string, OutletRemap> RemapsOf(JsonElement element) =>
        element.EnumerateObject().ToDictionary(
            property => property.Name,
            property => new OutletRemap(
                Enum.Parse<ShellOutletAction>(property.Value.GetProperty("action").GetString()!, ignoreCase: true),
                property.Value.TryGetProperty("target", out var target) ? target.GetString() : null),
            StringComparer.Ordinal);

    static string Describe(ShellSwitchPlan plan) => string.Join('\n', Lines(
        plan.From,
        plan.To,
        plan.FromPrimary,
        plan.ToPrimary,
        plan.IsNoOp,
        plan.CanSwitch,
        plan.Moves.Select(move => (move.Outlet, ToCamelCase(move.Action.ToString()), move.Target, string.Join(',', move.Screens), move.Description, string.Join(',', (move.Choices ?? []).Select(choice => $"{ToCamelCase(choice.Action.ToString())}:{choice.Target}")))),
        plan.AddPackages,
        plan.Blockers.Select(item => (ToCamelCase(item.Code.ToString()), item.Subject, item.Message)),
        plan.Warnings.Select(item => (ToCamelCase(item.Code.ToString()), item.Subject, item.Message))));

    static string DescribeExpected(JsonElement plan) => string.Join('\n', Lines(
        plan.GetProperty("from").GetString()!,
        plan.GetProperty("to").GetString()!,
        plan.GetProperty("fromPrimary").GetString()!,
        plan.GetProperty("toPrimary").GetString()!,
        plan.GetProperty("isNoOp").GetBoolean(),
        plan.GetProperty("canSwitch").GetBoolean(),
        plan.GetProperty("moves").EnumerateArray().Select(move => (
            move.GetProperty("outlet").GetString()!,
            move.GetProperty("action").GetString()!,
            move.TryGetProperty("target", out var target) ? target.GetString() : null,
            string.Join(',', move.GetProperty("screens").EnumerateArray().Select(item => item.GetString())),
            move.GetProperty("description").GetString()!,
            move.TryGetProperty("choices", out var choices)
                ? string.Join(',', choices.EnumerateArray().Select(choice => $"{choice.GetProperty("action").GetString()}:{(choice.TryGetProperty("target", out var t) ? t.GetString() : null)}"))
                : string.Empty)),
        plan.GetProperty("addPackages").EnumerateArray().Select(item => item.GetString()!),
        plan.GetProperty("blockers").EnumerateArray().Select(item => (item.GetProperty("code").GetString()!, item.TryGetProperty("subject", out var s) ? s.GetString() : null, item.GetProperty("message").GetString()!)),
        plan.GetProperty("warnings").EnumerateArray().Select(item => (item.GetProperty("code").GetString()!, item.TryGetProperty("subject", out var s) ? s.GetString() : null, item.GetProperty("message").GetString()!))));

    static IEnumerable<string> Lines(
        string from,
        string to,
        string fromPrimary,
        string toPrimary,
        bool isNoOp,
        bool canSwitch,
        IEnumerable<(string Outlet, string Action, string? Target, string Screens, string Description, string Choices)> moves,
        IEnumerable<string> addPackages,
        IEnumerable<(string Code, string? Subject, string Message)> blockers,
        IEnumerable<(string Code, string? Subject, string Message)> warnings)
    {
        yield return $"switch {from} -> {to} primary {fromPrimary} -> {toPrimary} noop {isNoOp} can {canSwitch}";
        foreach (var move in moves)
        {
            yield return $"move {move.Outlet}|{move.Action}|{move.Target}|{move.Screens}|{move.Description}|{move.Choices}";
        }

        yield return $"add {string.Join(',', addPackages)}";
        foreach (var item in blockers)
        {
            yield return $"blocker {item.Code}|{item.Subject}|{item.Message}";
        }

        foreach (var item in warnings)
        {
            yield return $"warning {item.Code}|{item.Subject}|{item.Message}";
        }
    }

    static string ToCamelCase(string value) => char.ToLowerInvariant(value[0]) + value[1..];

    sealed record SwitchCase(string Name, UiProfile Profile, TemplateReference CurrentRoot, TemplateReference CandidateRoot, List<Screen> Screens, Dictionary<string, OutletRemap> Remaps, string Expected);
}
