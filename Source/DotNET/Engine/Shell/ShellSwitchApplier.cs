// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Applies a <see cref="ShellSwitchPlan"/> to a document: the content each screen placed in an outlet of the current shell moves to the outlet the plan
/// names in the new one, dropped content is removed, kept outlets are untouched - and a screen template that fits a moved outlet fits the new outlet
/// instead, so the screens built from it move with it. A pure function: what it is given is never changed. The TypeScript twin is
/// <c language="csharp">applyShellSwitch</c> in <c language="csharp">@cratis/scene.engine</c>; both are asserted against the shared
/// <c language="csharp">shell-switch-apply-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// <list type="bullet">
/// <item>Content moved into an outlet is appended after what the outlet already holds, in the order of the outlets it came from. Kept outlets come first in the
/// screen's slot content, then the outlets the move created.</item>
/// <item>A screen built from a screen template has no content of its own in a shell outlet; its template's <c language="csharp">FitsSlot</c> is rewritten (a name qualified
/// with the current shell's name is requalified with the new shell's). A <em>dropped</em> outlet leaves the template without a <c language="csharp">FitsSlot</c>: placed
/// explicitly, not by declaration.</item>
/// <item>Only the screens and templates given are edited; a template that lives in an installed blueprint is not the application's to edit.</item>
/// <item>A screen's <c language="csharp">Layout</c> is not touched.</item>
/// <item>A plan with blockers is not applied.</item>
/// </list>
/// </remarks>
public static class ShellSwitchApplier
{
    /// <summary>
    /// Applies a plan to a document's screens and screen templates.
    /// </summary>
    /// <param name="screens">The document's screens.</param>
    /// <param name="screenTemplates">The document's screen templates.</param>
    /// <param name="plan">The plan from <see cref="ShellSwitchPlanner.Plan"/>, with every outlet that needed a decision decided.</param>
    /// <param name="templates">The screen templates a screen can be built from (<see cref="ShellPlacement.PlaceableScreenTemplates"/>); defaults to the document's own, without the root templates.</param>
    /// <returns>The screens and templates after the switch and what changed.</returns>
    public static ShellSwitchApplication Apply(
        IReadOnlyList<Screen> screens,
        IReadOnlyList<ScreenTemplate> screenTemplates,
        ShellSwitchPlan plan,
        IReadOnlyList<ScreenTemplate>? templates = null)
    {
        if (!plan.CanSwitch)
        {
            return new(screens, screenTemplates, false, []);
        }

        var placeable = templates ?? [.. screenTemplates.Where(template => template.Metadata?.Role != TemplateRole.Root)];
        var moves = new Dictionary<string, ShellOutletMove>(StringComparer.Ordinal);
        foreach (var move in plan.Moves)
        {
            moves.TryAdd(move.Outlet, move);
        }

        var changes = new List<ShellSwitchChange>();
        var movedScreens = new List<Screen>(screens.Select(screen => screen.ScreenTemplate is null ? WithContentMoved(screen, moves, changes) : screen));
        var movedTemplates = new List<ScreenTemplate>(screenTemplates.Select(template => WithPlacementMoved(template, plan, moves, placeable, changes)));

        return changes.Count == 0
            ? new(screens, screenTemplates, true, changes)
            : new(movedScreens, movedTemplates, true, changes);
    }

    static bool MovesContent(ShellOutletMove? move) =>
        move?.Action is ShellOutletAction.Primary or ShellOutletAction.MoveToPrimary or ShellOutletAction.MapTo or ShellOutletAction.Drop;

    static Screen WithContentMoved(Screen screen, Dictionary<string, ShellOutletMove> moves, List<ShellSwitchChange> changes)
    {
        if (!screen.SlotContent.Keys.Any(outlet => MovesContent(moves.GetValueOrDefault(outlet))))
        {
            return screen;
        }

        var kept = new List<KeyValuePair<string, List<SceneElement>>>();
        var arrived = new List<KeyValuePair<string, List<SceneElement>>>();
        foreach (var (outlet, content) in screen.SlotContent)
        {
            var move = moves.GetValueOrDefault(outlet);
            if (!MovesContent(move))
            {
                kept.Add(new(outlet, [.. content]));
                continue;
            }

            if (content.Count == 0)
            {
                continue;
            }

            var elements = $"{content.Count} {(content.Count == 1 ? "element" : "elements")}";
            if (move!.Action == ShellOutletAction.Drop || move.Target is null)
            {
                changes.Add(new(ShellSwitchChangeKind.Content, outlet, ShellOutletAction.Drop, content.Count, $"The {elements} of '{screen.Name}' in outlet '{outlet}' {(content.Count == 1 ? "is" : "are")} dropped", Screen: screen.Name));
                continue;
            }

            var entry = arrived.Find(item => item.Key == move.Target);
            if (entry.Key is null)
            {
                entry = new(move.Target, []);
                arrived.Add(entry);
            }

            entry.Value.AddRange(content);
            changes.Add(new(ShellSwitchChangeKind.Content, outlet, move.Action, content.Count, $"The {elements} of '{screen.Name}' in outlet '{outlet}' move{(content.Count == 1 ? "s" : string.Empty)} into '{move.Target}'", Screen: screen.Name, Target: move.Target));
        }

        var slotContent = new Dictionary<string, IReadOnlyList<SceneElement>>(StringComparer.Ordinal);
        foreach (var (outlet, content) in kept)
        {
            slotContent[outlet] = content;
        }

        foreach (var (outlet, content) in arrived)
        {
            slotContent[outlet] = slotContent.TryGetValue(outlet, out var existing) ? [.. existing, .. content] : content;
        }

        return screen with { SlotContent = slotContent };
    }

    static ScreenTemplate WithPlacementMoved(ScreenTemplate template, ShellSwitchPlan plan, Dictionary<string, ShellOutletMove> moves, IReadOnlyList<ScreenTemplate> templates, List<ShellSwitchChange> changes)
    {
        if (template.Metadata?.Role == TemplateRole.Root || template.FitsSlot is null)
        {
            return template;
        }

        var placement = ShellPlacement.PlacementOf(template.Name, plan.From, templates);
        if (placement is null || placement.Template != template.Name || !moves.TryGetValue(placement.Outlet, out var move))
        {
            return template;
        }

        var moving = MovesContent(move);
        if (!moving && move.Action != ShellOutletAction.Keep)
        {
            return template;
        }

        if (move.Action == ShellOutletAction.Drop)
        {
            changes.Add(new(ShellSwitchChangeKind.Placement, placement.Outlet, move.Action, 1, $"'{template.Name}' no longer fits outlet '{placement.Outlet}': it is placed explicitly", Template: template.Name));
            return template with { FitsSlot = null };
        }

        var target = moving ? move.Target ?? placement.Outlet : placement.Outlet;
        var fitsSlot = placement.Qualifier is null ? target : $"{(placement.Qualifier == plan.From ? plan.To : placement.Qualifier)}.{target}";
        if (fitsSlot == template.FitsSlot)
        {
            return template;
        }

        var sentence = target == placement.Outlet
            ? $"'{template.Name}' stays in outlet '{target}' of shell '{plan.To}'"
            : $"'{template.Name}' moves from outlet '{placement.Outlet}' to '{target}'";
        changes.Add(new(ShellSwitchChangeKind.Placement, placement.Outlet, move.Action, 1, sentence, Template: template.Name, Target: target));
        return template with { FitsSlot = fitsSlot };
    }
}
