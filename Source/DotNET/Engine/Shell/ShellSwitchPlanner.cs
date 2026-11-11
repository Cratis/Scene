// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Plans switching the application's shell: where the content of every slot of the current shell goes in the new one, what would be
/// lost, and what stops the switch. The pre-flight of "Use this shell"; the host shows the plan, offers the choices of any unresolved
/// slot, and on commit applies it as one undoable edit. The TypeScript twin is <c language="csharp">planShellSwitch</c> in
/// <c language="csharp">@cratis/scene.engine</c>; both are asserted against the shared <c language="csharp">shell-switch-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// The default mapping is by name, with the current shell's primary slot following to the new shell's primary slot (a slot named
/// <c language="csharp">content</c> does too when the new shell has no slot of that name). A slot the new shell lacks that screens place content in must be
/// decided - move into the primary slot, map to another slot or drop - through the remaps, keyed by the slot's name; until then it is
/// <see cref="ShellSlotAction.Unresolved"/> and a blocker. A choice for a slot that needs none is ignored. A slot no screen uses needs no decision.
/// </remarks>
public static class ShellSwitchPlanner
{
    const string ContentSlot = "content";
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
    /// <param name="remaps">The user's choices for the slots that need one, keyed by the slot of the current shell.</param>
    /// <returns>The plan; <see cref="ShellSwitchPlan.CanSwitch"/> says whether it can be committed.</returns>
    public static ShellSwitchPlan Plan(
        EffectiveShell current,
        EffectiveShell candidate,
        IReadOnlyList<Screen> screens,
        IReadOnlyList<ScreenTemplate>? templates = null,
        IReadOnlyDictionary<string, SlotRemap>? remaps = null)
    {
        var users = UsersBySlot(screens, current, templates ?? []);
        var shells = new ShellPair(current, candidate);
        var blockers = new List<ShellDiagnostic>();
        var slots = current.Slots.Concat(users.Keys.Where(slot => !current.Slots.Contains(slot)));
        var moves = slots
            .Select(slot => MoveOf(new SlotUse(slot, users.GetValueOrDefault(slot, []), RemapOf(remaps, slot)), shells, blockers))
            .ToList();

        var (addPackages, warnings) = SortCandidateDiagnostics(candidate, blockers);

        return new ShellSwitchPlan(
            current.Name,
            candidate.Name,
            current.PrimarySlot,
            candidate.PrimarySlot,
            current.Name == candidate.Name && current.Package == candidate.Package,
            moves,
            addPackages,
            blockers,
            warnings);
    }

    static OrderedDictionary<string, List<string>> UsersBySlot(IReadOnlyList<Screen> screens, EffectiveShell current, IReadOnlyList<ScreenTemplate> templates)
    {
        var users = new OrderedDictionary<string, List<string>>(StringComparer.Ordinal);
        var uses = screens.SelectMany(screen => ShellPlacement.SlotsUsedBy(screen, current.Name, templates).Select(slot => (Slot: slot, Screen: screen.Name)));
        foreach (var (slot, screen) in uses)
        {
            if (!users.TryGetValue(slot, out var names))
            {
                users[slot] = names = [];
            }

            if (!names.Contains(screen))
            {
                names.Add(screen);
            }
        }

        return users;
    }

    static SlotRemap? RemapOf(IReadOnlyDictionary<string, SlotRemap>? remaps, string slot) =>
        remaps is not null && remaps.TryGetValue(slot, out var remap) ? remap : null;

    static (List<string> AddPackages, List<ShellDiagnostic> Warnings) SortCandidateDiagnostics(EffectiveShell candidate, List<ShellDiagnostic> blockers)
    {
        var addPackages = new List<string>();
        var warnings = new List<ShellDiagnostic>();
        foreach (var diagnostic in candidate.Diagnostics.Where(diagnostic => diagnostic.Code != ShellDiagnosticCode.ProfileSlotUnplaced))
        {
            if (diagnostic.Code == ShellDiagnosticCode.RootTemplateBlueprintNotInstalled)
            {
                AddOnce(addPackages, candidate.Package);
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

        return (addPackages, warnings);
    }

    static void AddOnce(List<string> packages, string? package)
    {
        if (package is not null && !packages.Contains(package))
        {
            packages.Add(package);
        }
    }

    static ShellSlotMove MoveOf(SlotUse use, ShellPair shells, List<ShellDiagnostic> blockers)
    {
        var (slot, screens, _) = use;
        var (current, candidate) = shells;
        return DefaultMove(use, shells) ?? (screens.Count == 0
            ? new ShellSlotMove(slot, ShellSlotAction.Unused, screens, $"Slot '{slot}' of shell '{current.Name}' has no counterpart in shell '{candidate.Name}'; no screen uses it")
            : Remapped(use, candidate, blockers));
    }

    static ShellSlotMove? DefaultMove(SlotUse use, ShellPair shells)
    {
        var (slot, screens, _) = use;
        var (current, candidate) = shells;
        var inCurrent = current.Slots.Contains(slot);
        var keep = new ShellSlotMove(slot, ShellSlotAction.Keep, screens, KeepText(slot, screens), slot);
        var primary = new ShellSlotMove(slot, ShellSlotAction.Primary, screens, PrimaryText(slot, candidate, screens), candidate.PrimarySlot);

        if (inCurrent && slot == current.PrimarySlot)
        {
            return candidate.PrimarySlot == slot ? keep : primary;
        }

        if (candidate.Slots.Contains(slot))
        {
            return keep;
        }

        return slot == ContentSlot && inCurrent ? primary : null;
    }

    static ShellSlotMove Remapped(SlotUse use, EffectiveShell candidate, List<ShellDiagnostic> blockers)
    {
        var (slot, screens, remap) = use;
        var decided = Decided(use, candidate);
        if (decided is not null)
        {
            return decided;
        }

        var (count, names) = ScreensText(screens);
        var message = remap?.Action == ShellSlotAction.MapTo
            ? $"The content in slot '{slot}' cannot be mapped to '{remap.Target ?? string.Empty}': shell '{candidate.Name}' has no such slot"
            : $"{count} ({names}) {PlaceVerb(screens)} content in slot '{slot}', which shell '{candidate.Name}' does not have: move it into '{candidate.PrimarySlot}', map it to another slot or drop it";
        blockers.Add(new ShellDiagnostic(ShellDiagnosticCode.ProfileSlotUnplaced, message, slot));
        return new(slot, ShellSlotAction.Unresolved, screens, message, null, ChoicesFor(candidate));
    }

    static ShellSlotMove? Decided(SlotUse use, EffectiveShell candidate)
    {
        var (slot, screens, remap) = use;
        var content = $"The content that {ScreensText(screens).Names} {PlaceVerb(screens)} in slot '{slot}'";
        return remap?.Action switch
        {
            ShellSlotAction.MoveToPrimary => new(slot, ShellSlotAction.MoveToPrimary, screens, $"{content} moves into '{candidate.PrimarySlot}', the primary slot of shell '{candidate.Name}'", candidate.PrimarySlot),
            ShellSlotAction.Drop => new(slot, ShellSlotAction.Drop, screens, $"{content} is dropped"),
            ShellSlotAction.MapTo when remap.Target is not null && candidate.Slots.Contains(remap.Target) =>
                new(slot, ShellSlotAction.MapTo, screens, $"{content} moves into '{remap.Target}' of shell '{candidate.Name}'", remap.Target),
            _ => null
        };
    }

    static List<SlotRemap> ChoicesFor(EffectiveShell candidate) =>
    [
        new(ShellSlotAction.MoveToPrimary, candidate.PrimarySlot),
        .. candidate.Slots.Where(name => name != candidate.PrimarySlot).Select(name => new SlotRemap(ShellSlotAction.MapTo, name)),
        new(ShellSlotAction.Drop)
    ];

    static string PlaceVerb(List<string> screens) => screens.Count == 1 ? "places" : "place";

    static string KeepText(string slot, List<string> screens)
    {
        if (screens.Count == 0)
        {
            return $"Slot '{slot}' is kept; no screen uses it";
        }

        return $"{ScreensText(screens).Names} stay{(screens.Count == 1 ? "s" : string.Empty)} in slot '{slot}'";
    }

    static string PrimaryText(string slot, EffectiveShell candidate, List<string> screens)
    {
        if (screens.Count == 0)
        {
            return $"Slot '{slot}' becomes '{candidate.PrimarySlot}', the primary slot of shell '{candidate.Name}'; no screen uses it";
        }

        return $"{ScreensText(screens).Names} move{(screens.Count == 1 ? "s" : string.Empty)} from slot '{slot}' to '{candidate.PrimarySlot}', the primary slot of shell '{candidate.Name}'";
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

    sealed record ShellPair(EffectiveShell Current, EffectiveShell Candidate);

    sealed record SlotUse(string Slot, List<string> Screens, SlotRemap? Remap);
}
