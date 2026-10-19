// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Navigation.for_EffectiveNavigation;

public static class NavigationFixtures
{
    static readonly JsonSerializerOptions _read = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    static readonly JsonSerializerOptions _write = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public record ExpectedView(string Sources, IReadOnlyList<string> Items, NavigationRegionMode? Mode = null, IReadOnlyList<string>? Buttons = null);

    public record View(string? Module, NavigationRegionKind Region, ExpectedView Expected);

    public record ExpectedDiagnostic(string Code, string Message, string? Entry);

    public record Case(string Name, ApplicationStructure? Structure, NavigationModel Navigation, IReadOnlyList<string>? Slots, IReadOnlyList<View> Views, IReadOnlyList<ExpectedDiagnostic> ExpectedDiagnostics);

    public record EditCase(string Name, NavigationModel Navigation, JsonElement Call, JsonElement Expected);

    public static (ApplicationStructure Structure, IReadOnlyList<Case> Cases) LoadCases(string file)
    {
        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), file)));
        var structure = document.RootElement.GetProperty("structure").Deserialize<ApplicationStructure>(_read)!;
        var cases = document.RootElement.GetProperty("cases").Deserialize<List<Case>>(_read)!;
        return (structure, [.. cases.Select(fixture => fixture with { Structure = fixture.Structure ?? structure })]);
    }

    public static IReadOnlyList<EditCase> LoadEditCases(string file)
    {
        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), file)));
        return document.RootElement.GetProperty("editCases").Deserialize<List<EditCase>>(_read)!;
    }

    public static string DescribeView(ApplicationStructureIndex index, NavigationModel navigation, View view)
    {
        var region = EffectiveNavigation.Resolve(index, navigation, view.Module, view.Region);
        var mode = region.Mode is { } value ? $"mode={Camel(value.ToString())}\n" : string.Empty;
        return $"{mode}{Camel(region.Sources.Kind.ToString())}|{region.Sources.Label}\n{string.Join('\n', Lines(region.Items, 0))}{ButtonLines(region.Buttons ?? [])}";
    }

    public static string DescribeExpected(View view)
    {
        var mode = view.Expected.Mode is { } value ? $"mode={Camel(value.ToString())}\n" : string.Empty;
        return $"{mode}{view.Expected.Sources}\n{string.Join('\n', view.Expected.Items)}{(view.Expected.Buttons is { Count: > 0 } ? $"\nbuttons\n{string.Join('\n', view.Expected.Buttons)}" : string.Empty)}";
    }

    public static IEnumerable<string> DescribeDiagnostics(IEnumerable<NavigationDiagnostic> diagnostics) =>
        diagnostics.Select(diagnostic => $"{Camel(diagnostic.Code.ToString())}|{diagnostic.Entry}|{diagnostic.Message}");

    public static IEnumerable<string> DescribeExpected(IEnumerable<ExpectedDiagnostic> diagnostics) =>
        diagnostics.Select(diagnostic => $"{diagnostic.Code}|{diagnostic.Entry}|{diagnostic.Message}");

    public static NavigationEditPlan Plan(NavigationModel navigation, JsonElement call)
    {
        var module = call.TryGetProperty("module", out var moduleElement) ? moduleElement.GetString() : null;
        NavigationRegionKind Region() => call.GetProperty("region").Deserialize<NavigationRegionKind>(_read);
        switch (call.GetProperty("op").GetString())
        {
            case "switchRegionMode":
                return NavigationEdits.SwitchRegionMode(
                    navigation,
                    module,
                    Region(),
                    call.GetProperty("mode").Deserialize<NavigationRegionMode>(_read),
                    call.TryGetProperty("copy", out var copy) && copy.GetBoolean());
            case "addNavItem":
                return NavigationEdits.AddNavItem(
                    navigation,
                    module,
                    Region(),
                    call.GetProperty("item").Deserialize<NavItem>(_read)!,
                    call.TryGetProperty("parent", out var parent) ? parent.GetString() : null);
            case "setApplicationLogo":
                return NavigationEdits.SetApplicationLogo(module, call.GetProperty("logo").Deserialize<ApplicationLogo>(_read)!);
            default:
                throw new InvalidOperationException($"Unknown edit helper '{call.GetProperty("op").GetString()}'.");
        }
    }

    public static string Canonical(object value) => Canonical(JsonSerializer.SerializeToElement(value, _write));

    public static string Canonical(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.Object => "{" + string.Join(',', element.EnumerateObject().OrderBy(property => property.Name, StringComparer.Ordinal).Select(property => $"\"{property.Name}\":{Canonical(property.Value)}")) + "}",
        JsonValueKind.Array => "[" + string.Join(',', element.EnumerateArray().Select(Canonical)) + "]",
        _ => element.GetRawText()
    };

    static string ButtonLines(IReadOnlyList<EffectiveNavButton> buttons) =>
        buttons.Count == 0
            ? string.Empty
            : $"\nbuttons\n{string.Join('\n', buttons.Select(button => $"{button.Id}|{button.Origin.ToString().ToLowerInvariant()}|{(button.ReadOnly ? "locked" : "editable")}|{Camel(button.Emphasis.ToString())}|{button.Slice ?? "-"}|{button.Icon ?? "-"}|{button.Authorize ?? "-"}|{button.Reason}"))}";

    static IEnumerable<string> Lines(IReadOnlyList<EffectiveNavItem> items, int depth)
    {
        foreach (var item in items)
        {
            yield return $"{new string(' ', depth * 2)}{item.Id}|{item.Origin.ToString().ToLowerInvariant()}|{(item.ReadOnly ? "locked" : "editable")}|{item.Target?.ResolvedFeature ?? "-"}|{item.Slot}|{item.Icon ?? "-"}|{item.Reason}";
            foreach (var line in Lines(item.Children ?? [], depth + 1))
            {
                yield return line;
            }
        }
    }

    static string Camel(string name) => char.ToLowerInvariant(name[0]) + name[1..];

    static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new DirectoryNotFoundException("Could not locate the repository root (Scene.slnx) above " + AppContext.BaseDirectory);
    }
}
