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
        templates ??= [];
        var users = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        var used = new List<string>();
        foreach (var screen in screens)
        {
            foreach (var slot in ShellPlacement.SlotsUsedBy(screen, current.Name, templates))
            {
                if (!users.TryGetValue(slot, out var names))
                {
                    users[slot] = names = [];
                }

                if (!names.Contains(screen.Name))
                {
                    names.Add(screen.Name);
                }

                if (!used.Contains(slot))
                {
                    used.Add(slot);
                }
            }
        }

        var blockers = new List<ShellDiagnostic>();
        var slots = current.Slots.Concat(used.Where(slot => !current.Slots.Contains(slot)));
        var moves = slots
            .Select(slot => MoveOf(
                slot,
                current,
                candidate,
                users.TryGetValue(slot, out var found) ? found : [],
                remaps is not null && remaps.TryGetValue(slot, out var remap) ? remap : null,
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
            current.PrimarySlot,
            candidate.PrimarySlot,
            current.Name == candidate.Name && current.Package == candidate.Package,
            moves,
            addPackages,
            blockers,
            warnings);
    }

    static ShellSlotMove MoveOf(string slot, EffectiveShell current, EffectiveShell candidate, List<string> screens, SlotRemap? remap, List<ShellDiagnostic> blockers)
    {
        if (current.Slots.Contains(slot) && slot == current.PrimarySlot)
        {
            return candidate.PrimarySlot == slot
                ? new(slot, ShellSlotAction.Keep, screens, KeepText(slot, screens), slot)
                : new(slot, ShellSlotAction.Primary, screens, PrimaryText(slot, candidate, screens), candidate.PrimarySlot);
        }

        if (candidate.Slots.Contains(slot))
        {
            return new(slot, ShellSlotAction.Keep, screens, KeepText(slot, screens), slot);
        }

        if (slot == ContentSlot && current.Slots.Contains(slot))
        {
            return new(slot, ShellSlotAction.Primary, screens, PrimaryText(slot, candidate, screens), candidate.PrimarySlot);
        }

        if (screens.Count == 0)
        {
            return new(slot, ShellSlotAction.Unused, screens, $"Slot '{slot}' of shell '{current.Name}' has no counterpart in shell '{candidate.Name}'; no screen uses it");
        }

        return Remapped(slot, candidate, screens, remap, blockers);
    }

    static ShellSlotMove Remapped(string slot, EffectiveShell candidate, List<string> screens, SlotRemap? remap, List<ShellDiagnostic> blockers)
    {
        var (count, names) = ScreensText(screens);
        var place = screens.Count == 1 ? "places" : "place";
        List<SlotRemap> choices =
        [
            new(ShellSlotAction.MoveToPrimary, candidate.PrimarySlot),
            .. candidate.Slots.Where(name => name != candidate.PrimarySlot).Select(name => new SlotRemap(ShellSlotAction.MapTo, name)),
            new(ShellSlotAction.Drop)
        ];

        if (remap?.Action == ShellSlotAction.MoveToPrimary)
        {
            return new(slot, ShellSlotAction.MoveToPrimary, screens, $"The content that {names} {place} in slot '{slot}' moves into '{candidate.PrimarySlot}', the primary slot of shell '{candidate.Name}'", candidate.PrimarySlot);
        }

        if (remap?.Action == ShellSlotAction.Drop)
        {
            return new(slot, ShellSlotAction.Drop, screens, $"The content that {names} {place} in slot '{slot}' is dropped");
        }

        var message = $"{count} ({names}) {place} content in slot '{slot}', which shell '{candidate.Name}' does not have: move it into '{candidate.PrimarySlot}', map it to another slot or drop it";
        if (remap?.Action == ShellSlotAction.MapTo)
        {
            if (remap.Target is not null && candidate.Slots.Contains(remap.Target))
            {
                return new(slot, ShellSlotAction.MapTo, screens, $"The content that {names} {place} in slot '{slot}' moves into '{remap.Target}' of shell '{candidate.Name}'", remap.Target);
            }

            message = $"The content in slot '{slot}' cannot be mapped to '{remap.Target ?? string.Empty}': shell '{candidate.Name}' has no such slot";
        }

        blockers.Add(new ShellDiagnostic(ShellDiagnosticCode.ProfileSlotUnplaced, message, slot));
        return new(slot, ShellSlotAction.Unresolved, screens, message, null, choices);
    }

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
}
