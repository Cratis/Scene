// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Plans switching the application's shell: where the content of every outlet of the current shell goes in the new one, what would be
/// lost, and what stops the switch. The pre-flight of "Use this shell"; the host shows the plan, offers the choices of any unresolved
/// outlet, and on commit applies it as one undoable edit. The TypeScript twin is <c language="csharp">planShellSwitch</c> in
/// <c language="csharp">@cratis/scene.engine</c>; both are asserted against the shared <c language="csharp">shell-switch-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// The default mapping is by name, with the current shell's primary outlet following to the new shell's primary outlet (an outlet named
/// <c language="csharp">content</c> does too when the new shell has no outlet of that name). An outlet the new shell lacks that screens place content in must be
/// decided - move into the primary outlet, map to another outlet or drop - through the remaps, keyed by the outlet's name; until then it is
/// <see cref="ShellOutletAction.Unresolved"/> and a blocker. A choice for an outlet that needs none is ignored. An outlet no screen uses needs no decision.
/// </remarks>
public static class ShellSwitchPlanner
{
    const string ContentOutlet = "content";
    const int NamedScreens = 3;

    static readonly HashSet<ShellDiagnosticCode> _blocking =
    [
        ShellDiagnosticCode.RootTemplateUnknown,
        ShellDiagnosticCode.RootTemplateVersionNotSatisfied,
        ShellDiagnosticCode.RootTemplateNotApplicable,
        ShellDiagnosticCode.RootTemplateMissingContentSlot,
        ShellDiagnosticCode.RootTemplateCycle
    ];

    /// <summary>
    /// Plans the switch from one resolved shell to another.
    /// </summary>
    /// <param name="current">The shell in place, from <see cref="ShellResolver.Resolve"/>.</param>
    /// <param name="candidate">The shell being switched to, resolved the same way with the candidate as the profile's root.</param>
    /// <param name="screens">The application's screens.</param>
    /// <param name="templates">The screen templates a screen can be built from (<see cref="ShellPlacement.PlaceableScreenTemplates"/>).</param>
    /// <param name="remaps">The user's choices for the outlets that need one, keyed by the outlet of the current shell.</param>
    /// <returns>The plan; <see cref="ShellSwitchPlan.CanSwitch"/> says whether it can be committed.</returns>
    public static ShellSwitchPlan Plan(
        EffectiveShell current,
        EffectiveShell candidate,
        IReadOnlyList<Screen> screens,
        IReadOnlyList<ScreenTemplate>? templates = null,
        IReadOnlyDictionary<string, OutletRemap>? remaps = null)
    {
        templates ??= [];
        var users = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        var used = new List<string>();
        foreach (var screen in screens)
        {
            foreach (var outlet in ShellPlacement.OutletsUsedBy(screen, current.Name, templates))
            {
                if (!users.TryGetValue(outlet, out var names))
                {
                    users[outlet] = names = [];
                }

                if (!names.Contains(screen.Name))
                {
                    names.Add(screen.Name);
                }

                if (!used.Contains(outlet))
                {
                    used.Add(outlet);
                }
            }
        }

        var blockers = new List<ShellDiagnostic>();
        var outlets = current.Outlets.Concat(used.Where(outlet => !current.Outlets.Contains(outlet)));
        var moves = outlets
            .Select(outlet => MoveOf(
                outlet,
                current,
                candidate,
                users.TryGetValue(outlet, out var found) ? found : [],
                remaps is not null && remaps.TryGetValue(outlet, out var remap) ? remap : null,
                blockers))
            .ToList();

        var addPackages = new List<string>();
        var warnings = new List<ShellDiagnostic>();
        foreach (var diagnostic in candidate.Diagnostics)
        {
            if (diagnostic.Code == ShellDiagnosticCode.ProfileSlotUnplaced)
            {
                continue;
            }

            if (diagnostic.Code == ShellDiagnosticCode.RootTemplateBlueprintNotInstalled)
            {
                if (candidate.Package is not null && !addPackages.Contains(candidate.Package))
                {
                    addPackages.Add(candidate.Package);
                }
            }
            else if (_blocking.Contains(diagnostic.Code))
            {
                blockers.Insert(0, diagnostic);
            }
            else
            {
                warnings.Add(diagnostic);
            }
        }

        return new ShellSwitchPlan(
            current.Name,
            candidate.Name,
            current.PrimaryOutlet,
            candidate.PrimaryOutlet,
            current.Name == candidate.Name && current.Package == candidate.Package,
            moves,
            addPackages,
            blockers,
            warnings);
    }

    static ShellOutletMove MoveOf(string outlet, EffectiveShell current, EffectiveShell candidate, List<string> screens, OutletRemap? remap, List<ShellDiagnostic> blockers)
    {
        if (current.Outlets.Contains(outlet) && outlet == current.PrimaryOutlet)
        {
            return candidate.PrimaryOutlet == outlet
                ? new(outlet, ShellOutletAction.Keep, screens, KeepText(outlet, screens), outlet)
                : new(outlet, ShellOutletAction.Primary, screens, PrimaryText(outlet, candidate, screens), candidate.PrimaryOutlet);
        }

        if (candidate.Outlets.Contains(outlet))
        {
            return new(outlet, ShellOutletAction.Keep, screens, KeepText(outlet, screens), outlet);
        }

        if (outlet == ContentOutlet && current.Outlets.Contains(outlet))
        {
            return new(outlet, ShellOutletAction.Primary, screens, PrimaryText(outlet, candidate, screens), candidate.PrimaryOutlet);
        }

        if (screens.Count == 0)
        {
            return new(outlet, ShellOutletAction.Unused, screens, $"Outlet '{outlet}' of shell '{current.Name}' has no counterpart in shell '{candidate.Name}'; no screen uses it");
        }

        return Remapped(outlet, candidate, screens, remap, blockers);
    }

    static ShellOutletMove Remapped(string outlet, EffectiveShell candidate, List<string> screens, OutletRemap? remap, List<ShellDiagnostic> blockers)
    {
        var (count, names) = ScreensText(screens);
        var place = screens.Count == 1 ? "places" : "place";
        List<OutletRemap> choices =
        [
            new(ShellOutletAction.MoveToPrimary, candidate.PrimaryOutlet),
            .. candidate.Outlets.Where(name => name != candidate.PrimaryOutlet).Select(name => new OutletRemap(ShellOutletAction.MapTo, name)),
            new(ShellOutletAction.Drop)
        ];

        if (remap?.Action == ShellOutletAction.MoveToPrimary)
        {
            return new(outlet, ShellOutletAction.MoveToPrimary, screens, $"The content that {names} {place} in outlet '{outlet}' moves into '{candidate.PrimaryOutlet}', the primary outlet of shell '{candidate.Name}'", candidate.PrimaryOutlet);
        }

        if (remap?.Action == ShellOutletAction.Drop)
        {
            return new(outlet, ShellOutletAction.Drop, screens, $"The content that {names} {place} in outlet '{outlet}' is dropped");
        }

        var message = $"{count} ({names}) {place} content in outlet '{outlet}', which shell '{candidate.Name}' does not have: move it into '{candidate.PrimaryOutlet}', map it to another outlet or drop it";
        if (remap?.Action == ShellOutletAction.MapTo)
        {
            if (remap.Target is not null && candidate.Outlets.Contains(remap.Target))
            {
                return new(outlet, ShellOutletAction.MapTo, screens, $"The content that {names} {place} in outlet '{outlet}' moves into '{remap.Target}' of shell '{candidate.Name}'", remap.Target);
            }

            message = $"The content in outlet '{outlet}' cannot be mapped to '{remap.Target ?? string.Empty}': shell '{candidate.Name}' has no such outlet";
        }

        blockers.Add(new ShellDiagnostic(ShellDiagnosticCode.ProfileSlotUnplaced, message, outlet));
        return new(outlet, ShellOutletAction.Unresolved, screens, message, null, choices);
    }

    static string KeepText(string outlet, List<string> screens)
    {
        if (screens.Count == 0)
        {
            return $"Outlet '{outlet}' is kept; no screen uses it";
        }

        return $"{ScreensText(screens).Names} stay{(screens.Count == 1 ? "s" : string.Empty)} in outlet '{outlet}'";
    }

    static string PrimaryText(string outlet, EffectiveShell candidate, List<string> screens)
    {
        if (screens.Count == 0)
        {
            return $"Outlet '{outlet}' becomes '{candidate.PrimaryOutlet}', the primary outlet of shell '{candidate.Name}'; no screen uses it";
        }

        return $"{ScreensText(screens).Names} move{(screens.Count == 1 ? "s" : string.Empty)} from outlet '{outlet}' to '{candidate.PrimaryOutlet}', the primary outlet of shell '{candidate.Name}'";
    }

    static (string Count, string Names) ScreensText(List<string> screens)
    {
        var count = $"{screens.Count} {(screens.Count == 1 ? "screen" : "screens")}";
        var quoted = new List<string>(screens.Select(name => $"'{name}'"));
        if (screens.Count <= NamedScreens)
        {
            return (count, quoted.Count == 1 ? quoted[0] : $"{string.Join(", ", quoted.Take(quoted.Count - 1))} and {quoted[^1]}");
        }

        return (count, $"{string.Join(", ", quoted.Take(NamedScreens))} and {screens.Count - NamedScreens} more");
    }
}
