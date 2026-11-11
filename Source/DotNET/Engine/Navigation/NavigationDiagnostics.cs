// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Diagnoses how destinations, slots, routes and targets fit together: duplicate routes, duplicate, missing
/// or incompatible slots, hosting cycles and unavailable targets - and, when the graph carries an application structure and
/// navigation, its navigation outlets too. Nothing is rewritten and no URL is constructed.
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">diagnoseNavigation</c>) reports the same codes and messages in the same order for
/// the same model; both are asserted against <c language="csharp">navigation-diagnostic-fixtures.json</c>.
/// </remarks>
public static class NavigationDiagnostics
{
    /// <summary>
    /// Diagnoses a navigation graph.
    /// </summary>
    /// <param name="graph">The destinations and the catalogs they refer to.</param>
    /// <param name="routeKey">
    /// Decides which route a destination occupies; <see langword="null"/> compares authored route overrides
    /// (<see cref="NavigationRoutes.AuthoredRouteKey"/>). A host that derives routes supplies its own derivation.
    /// </param>
    /// <returns>The problems found, in a stable order.</returns>
    public static IReadOnlyList<NavigationDiagnostic> Diagnose(NavigationGraph graph, Func<DestinationReference, string?>? routeKey = null)
    {
        var diagnostics = new List<NavigationDiagnostic>();
        var run = new DiagnosisRun(
            graph,
            routeKey ?? NavigationRoutes.AuthoredRouteKey,
            diagnostics,
            CollectSlots(graph, diagnostics),
            graph.Screens?.GroupBy(screen => screen.Name, StringComparer.Ordinal).ToDictionary(group => group.Key, group => group.First(), StringComparer.Ordinal),
            new Dictionary<string, (string Entry, string Target)>(StringComparer.Ordinal),
            new Dictionary<string, List<string>>(StringComparer.Ordinal));

        for (var index = 0; index < graph.Entries.Count; index++)
        {
            DiagnoseEntry(run, graph.Entries[index], index);
        }

        diagnostics.AddRange(HostingCycles.Find(graph.Screens?.Select(screen => screen.Name) ?? [], run.HostedIn).Select(CycleDiagnostic));

        if (graph.Structure is not null && graph.Navigation is not null)
        {
            diagnostics.AddRange(NavigationOutletDiagnostics.Diagnose(new ApplicationStructureIndex(graph.Structure), graph.Navigation, graph.Slots));
        }

        return diagnostics;
    }

    static NavigationDiagnostic CycleDiagnostic(IReadOnlyList<string> cycle) => new(
        NavigationDiagnosticCode.NavigationCycle,
        $"Navigation cycle {string.Join(" -> ", cycle.Append(cycle[0]))}: each screen is placed in a slot owned by the next, so composition never terminates.");

    static void DiagnoseEntry(DiagnosisRun run, NavigationEntry navigationEntry, int index)
    {
        var destination = navigationEntry.Destination;
        var entry = navigationEntry.Id ?? $"#{index + 1}";
        var kind = destination.Kind ?? (string.IsNullOrEmpty(destination.Dialog) ? DestinationKind.Slot : DestinationKind.Dialog);
        var placement = new Placement(run.Graph, run.Screens, destination, kind, entry, (code, message) => run.Diagnostics.Add(new(code, message, entry)));

        if (NamesNoTarget(destination))
        {
            placement.Report(NavigationDiagnosticCode.UnavailableTarget, $"Destination '{entry}' names no screen, stable identity, route or dialog.");
            return;
        }

        DiagnoseTarget(placement);
        var owner = DiagnoseSlot(placement, run.Slots);
        if (IsHostedByTemplate(owner, placement)) RecordHosts(run.Graph, owner!, destination.Screen!, run.HostedIn);
        DiagnoseRoute(run, placement);
    }

    static bool IsHostedByTemplate(SlotOwner? owner, Placement placement) =>
        owner is { OwnedByLayout: false } && !string.IsNullOrEmpty(placement.Destination.Screen) && placement.Screens?.ContainsKey(placement.Destination.Screen) == true;

    static void DiagnoseRoute(DiagnosisRun run, Placement placement)
    {
        var destination = placement.Destination;
        var route = placement.Kind == DestinationKind.External ? null : run.RouteKey(destination);
        if (string.IsNullOrEmpty(route)) return;
        var conflict = ClaimRoute(run.Routes, route, (placement.Entry, NavigationRoutes.TargetOf(destination, KindName(placement.Kind))), destination.Route ?? route);
        if (conflict is not null) placement.Report(NavigationDiagnosticCode.DuplicateRoute, conflict);
    }

    static bool NamesNoTarget(DestinationReference destination) =>
        string.IsNullOrEmpty(destination.Screen) && string.IsNullOrEmpty(destination.Module) && string.IsNullOrEmpty(destination.Route) && string.IsNullOrEmpty(destination.Dialog);

    static void RecordHosts(NavigationGraph graph, SlotOwner owner, string screen, Dictionary<string, List<string>> hostedIn)
    {
        if (!hostedIn.TryGetValue(screen, out var hosts))
        {
            hostedIn[screen] = hosts = [];
        }

        hosts.AddRange(graph.Screens!.Where(candidate => candidate.ScreenTemplate == owner.Owner && !hosts.Contains(candidate.Name)).Select(candidate => candidate.Name));
    }

    static string? ClaimRoute(Dictionary<string, (string Entry, string Target)> routes, string route, (string Entry, string Target) claim, string shown)
    {
        if (!routes.TryGetValue(route, out var existing))
        {
            routes[route] = claim;
            return null;
        }

        return existing.Target == claim.Target
            ? null
            : $"Route '{shown}' is used by destinations '{existing.Entry}' and '{claim.Entry}', which open different targets.";
    }

    static NavigationDiagnostic? ClaimSlot(Dictionary<string, SlotOwner> owners, SlotOwner claim)
    {
        if (!owners.TryGetValue(claim.Slot.Name, out var existing))
        {
            owners[claim.Slot.Name] = claim;
            return null;
        }

        return new(
            NavigationDiagnosticCode.DuplicateSlot,
            $"Slot '{claim.Slot.Name}' is declared by both '{existing.Owner}' and '{claim.Owner}'; destinations cannot tell them apart.");
    }

    static Dictionary<string, SlotOwner> CollectSlots(NavigationGraph graph, List<NavigationDiagnostic> diagnostics)
    {
        var owners = new Dictionary<string, SlotOwner>(StringComparer.Ordinal);

        // Only a routed slot is a destination; the others are filled by composition, not navigation.
        var surfaces = (graph.Layouts ?? []).Select(layout => (layout.Name, OwnedByLayout: true, Slots: Routed(layout.Slots)))
            .Concat((graph.ScreenTemplates ?? []).Select(template => (template.Name, OwnedByLayout: false, Slots: Routed(template.Slots))));

        foreach (var (name, ownedByLayout, declared) in surfaces)
        {
            foreach (var slot in declared)
            {
                var duplicate = ClaimSlot(owners, new(slot, name, ownedByLayout));
                if (duplicate is not null) diagnostics.Add(duplicate);
            }
        }

        return owners;
    }

    static IEnumerable<Slot> Routed(IReadOnlyList<Slot>? slots) => (slots ?? []).Where(slot => slot.Routed == true);

    static void DiagnoseTarget(Placement placement)
    {
        var (_, screens, destination, kind, entry, report) = placement;
        if (kind == DestinationKind.Dialog)
        {
            DiagnoseDialogTarget(placement);
            return;
        }

        if (kind == DestinationKind.Slot && OpensMissingScreen(destination, screens))
        {
            report(NavigationDiagnosticCode.UnavailableTarget, $"Destination '{entry}' opens screen '{destination.Screen}', which does not exist.");
        }
    }

    static bool OpensMissingScreen(DestinationReference destination, Dictionary<string, Screen>? screens) =>
        !string.IsNullOrEmpty(destination.Screen) && screens?.ContainsKey(destination.Screen) == false;

    static void DiagnoseDialogTarget(Placement placement)
    {
        var (graph, _, destination, _, entry, report) = placement;
        if (string.IsNullOrEmpty(destination.Dialog))
        {
            report(NavigationDiagnosticCode.UnavailableTarget, $"Dialog destination '{entry}' names no dialog.");
        }
        else if (graph.DialogTemplates?.Any(template => template.Name == destination.Dialog) == false)
        {
            report(NavigationDiagnosticCode.UnavailableTarget, $"Destination '{entry}' opens dialog '{destination.Dialog}', which no dialog template provides.");
        }
    }

    static SlotOwner? DiagnoseSlot(Placement placement, Dictionary<string, SlotOwner> slots)
    {
        var owner = FindSlotOwner(placement, slots);
        if (owner is null) return null;

        var screen = PlacedScreen(placement);
        if (screen is not null) DiagnosePlacedScreen(placement, owner, screen);
        return owner;
    }

    static Screen? PlacedScreen(Placement placement)
    {
        var (_, screens, destination, _, _, _) = placement;
        if (string.IsNullOrEmpty(destination.Screen) || screens is null) return null;
        return screens.GetValueOrDefault(destination.Screen);
    }

    static SlotOwner? FindSlotOwner(Placement placement, Dictionary<string, SlotOwner> slots)
    {
        var (_, _, destination, kind, entry, report) = placement;
        if (string.IsNullOrEmpty(destination.Slot)) return null;

        if (kind != DestinationKind.Slot)
        {
            var opens = kind == DestinationKind.Dialog ? "a dialog" : "an external target";
            report(NavigationDiagnosticCode.IncompatibleSlot, $"Destination '{entry}' opens {opens} but names slot '{destination.Slot}'; only slot destinations render in slots.");
            return null;
        }

        if (slots.TryGetValue(destination.Slot, out var owner)) return owner;
        report(NavigationDiagnosticCode.MissingSlot, $"Destination '{entry}' targets missing slot '{destination.Slot}'.");
        return null;
    }

    static void DiagnosePlacedScreen(Placement placement, SlotOwner owner, Screen screen)
    {
        var (graph, _, _, _, entry, report) = placement;
        if (owner.OwnedByLayout && screen.Layout != owner.Owner)
        {
            report(
                NavigationDiagnosticCode.IncompatibleSlot,
                $"Slot '{owner.Slot.Name}' belongs to layout '{owner.Owner}', but destination '{entry}' places '{screen.Name}', which renders in layout '{screen.Layout}'.");
        }

        if (owner.Slot.Accepts is null) return;
        var type = graph.ScreenTemplates?.FirstOrDefault(template => template.Name == screen.ScreenTemplate)?.Metadata?.Type;
        if (string.IsNullOrEmpty(type) || !owner.Slot.Accepts.Contains(type))
        {
            report(
                NavigationDiagnosticCode.IncompatibleSlot,
                $"Slot '{owner.Slot.Name}' accepts {string.Join(", ", owner.Slot.Accepts)} screens, but destination '{entry}' places '{screen.Name}' of type '{(string.IsNullOrEmpty(type) ? "untyped" : type)}'.");
        }
    }

    static string KindName(DestinationKind kind) => kind switch
    {
        DestinationKind.Dialog => "dialog",
        DestinationKind.External => "external",
        _ => "slot"
    };

    sealed record Placement(NavigationGraph Graph, Dictionary<string, Screen>? Screens, DestinationReference Destination, DestinationKind Kind, string Entry, Action<NavigationDiagnosticCode, string> Report);

    sealed record DiagnosisRun(
        NavigationGraph Graph,
        Func<DestinationReference, string?> RouteKey,
        List<NavigationDiagnostic> Diagnostics,
        Dictionary<string, SlotOwner> Slots,
        Dictionary<string, Screen>? Screens,
        Dictionary<string, (string Entry, string Target)> Routes,
        Dictionary<string, List<string>> HostedIn);
}
