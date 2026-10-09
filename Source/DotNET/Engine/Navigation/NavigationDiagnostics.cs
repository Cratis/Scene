// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Diagnoses how destinations, outlets, routes and targets fit together: duplicate routes, duplicate, missing
/// or incompatible outlets, hosting cycles and unavailable targets. Nothing is rewritten and no URL is constructed.
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
        routeKey ??= NavigationRoutes.AuthoredRouteKey;
        var diagnostics = new List<NavigationDiagnostic>();
        var outlets = CollectOutlets(graph, diagnostics);
        var screens = graph.Screens?.GroupBy(screen => screen.Name, StringComparer.Ordinal).ToDictionary(group => group.Key, group => group.First(), StringComparer.Ordinal);
        var routes = new Dictionary<string, (string Entry, string Target)>(StringComparer.Ordinal);
        var hostedIn = new Dictionary<string, List<string>>(StringComparer.Ordinal);

        for (var index = 0; index < graph.Entries.Count; index++)
        {
            var destination = graph.Entries[index].Destination;
            var entry = graph.Entries[index].Id ?? $"#{index + 1}";
            var kind = destination.Kind ?? (string.IsNullOrEmpty(destination.Dialog) ? DestinationKind.Outlet : DestinationKind.Dialog);
            void Report(NavigationDiagnosticCode code, string message) => diagnostics.Add(new(code, message, entry));

            if (string.IsNullOrEmpty(destination.Screen) && string.IsNullOrEmpty(destination.Module) && string.IsNullOrEmpty(destination.Route) && string.IsNullOrEmpty(destination.Dialog))
            {
                Report(NavigationDiagnosticCode.UnavailableTarget, $"Destination '{entry}' names no screen, stable identity, route or dialog.");
                continue;
            }

            DiagnoseTarget(graph, screens, destination, kind, entry, Report);
            var owner = DiagnoseOutlet(graph, outlets, screens, destination, kind, entry, Report);
            if (owner is { OwnedByLayout: false } && !string.IsNullOrEmpty(destination.Screen) && screens?.ContainsKey(destination.Screen) == true)
            {
                if (!hostedIn.TryGetValue(destination.Screen, out var hosts))
                {
                    hostedIn[destination.Screen] = hosts = [];
                }

                hosts.AddRange(graph.Screens!.Where(screen => screen.ScreenTemplate == owner.Owner && !hosts.Contains(screen.Name)).Select(screen => screen.Name));
            }

            var route = kind == DestinationKind.External ? null : routeKey(destination);
            if (!string.IsNullOrEmpty(route))
            {
                var target = NavigationRoutes.TargetOf(destination, KindName(kind));
                if (!routes.TryGetValue(route, out var existing))
                {
                    routes[route] = (entry, target);
                }
                else if (existing.Target != target)
                {
                    Report(NavigationDiagnosticCode.DuplicateRoute, $"Route '{destination.Route ?? route}' is used by destinations '{existing.Entry}' and '{entry}', which open different targets.");
                }
            }
        }

        foreach (var cycle in HostingCycles.Find(graph.Screens?.Select(screen => screen.Name) ?? [], hostedIn))
        {
            diagnostics.Add(new(
                NavigationDiagnosticCode.NavigationCycle,
                $"Navigation cycle {string.Join(" -> ", cycle.Append(cycle[0]))}: each screen is placed in an outlet owned by the next, so composition never terminates."));
        }

        return diagnostics;
    }

    static Dictionary<string, OutletOwner> CollectOutlets(NavigationGraph graph, List<NavigationDiagnostic> diagnostics)
    {
        var owners = new Dictionary<string, OutletOwner>(StringComparer.Ordinal);
        var surfaces = (graph.Layouts ?? []).Select(layout => (layout.Name, OwnedByLayout: true, Outlets: layout.Outlets ?? []))
            .Concat((graph.ScreenTemplates ?? []).Select(template => (template.Name, OwnedByLayout: false, Outlets: template.Outlets ?? [])));

        foreach (var (name, ownedByLayout, declared) in surfaces)
        {
            foreach (var outlet in declared)
            {
                if (owners.TryGetValue(outlet.Name, out var existing))
                {
                    diagnostics.Add(new(
                        NavigationDiagnosticCode.DuplicateOutlet,
                        $"Outlet '{outlet.Name}' is declared by both '{existing.Owner}' and '{name}'; destinations cannot tell them apart."));
                    continue;
                }

                owners[outlet.Name] = new(outlet, name, ownedByLayout);
            }
        }

        return owners;
    }

    static void DiagnoseTarget(
        NavigationGraph graph,
        Dictionary<string, Screen>? screens,
        DestinationReference destination,
        DestinationKind kind,
        string entry,
        Action<NavigationDiagnosticCode, string> report)
    {
        if (kind == DestinationKind.Dialog)
        {
            if (string.IsNullOrEmpty(destination.Dialog))
            {
                report(NavigationDiagnosticCode.UnavailableTarget, $"Dialog destination '{entry}' names no dialog.");
            }
            else if (graph.DialogTemplates?.Any(template => template.Name == destination.Dialog) == false)
            {
                report(NavigationDiagnosticCode.UnavailableTarget, $"Destination '{entry}' opens dialog '{destination.Dialog}', which no dialog template provides.");
            }

            return;
        }

        if (kind == DestinationKind.Outlet && !string.IsNullOrEmpty(destination.Screen) && screens?.ContainsKey(destination.Screen) == false)
        {
            report(NavigationDiagnosticCode.UnavailableTarget, $"Destination '{entry}' opens screen '{destination.Screen}', which does not exist.");
        }
    }

    static OutletOwner? DiagnoseOutlet(
        NavigationGraph graph,
        Dictionary<string, OutletOwner> outlets,
        Dictionary<string, Screen>? screens,
        DestinationReference destination,
        DestinationKind kind,
        string entry,
        Action<NavigationDiagnosticCode, string> report)
    {
        if (string.IsNullOrEmpty(destination.Outlet)) return null;

        if (kind != DestinationKind.Outlet)
        {
            var opens = kind == DestinationKind.Dialog ? "a dialog" : "an external target";
            report(NavigationDiagnosticCode.IncompatibleOutlet, $"Destination '{entry}' opens {opens} but names outlet '{destination.Outlet}'; only outlet destinations render in outlets.");
            return null;
        }

        if (!outlets.TryGetValue(destination.Outlet, out var owner))
        {
            report(NavigationDiagnosticCode.MissingOutlet, $"Destination '{entry}' targets missing outlet '{destination.Outlet}'.");
            return null;
        }

        if (string.IsNullOrEmpty(destination.Screen) || screens is null || !screens.TryGetValue(destination.Screen, out var screen)) return owner;

        if (owner.OwnedByLayout && screen.Layout != owner.Owner)
        {
            report(
                NavigationDiagnosticCode.IncompatibleOutlet,
                $"Outlet '{owner.Outlet.Name}' belongs to layout '{owner.Owner}', but destination '{entry}' places '{screen.Name}', which renders in layout '{screen.Layout}'.");
        }

        if (owner.Outlet.Accepts is not null)
        {
            var type = graph.ScreenTemplates?.FirstOrDefault(template => template.Name == screen.ScreenTemplate)?.Metadata?.Type;
            if (string.IsNullOrEmpty(type) || !owner.Outlet.Accepts.Contains(type))
            {
                report(
                    NavigationDiagnosticCode.IncompatibleOutlet,
                    $"Outlet '{owner.Outlet.Name}' accepts {string.Join(", ", owner.Outlet.Accepts)} screens, but destination '{entry}' places '{screen.Name}' of type '{(string.IsNullOrEmpty(type) ? "untyped" : type)}'.");
            }
        }

        return owner;
    }

    static string KindName(DestinationKind kind) => kind switch
    {
        DestinationKind.Dialog => "dialog",
        DestinationKind.External => "external",
        _ => "outlet"
    };
}
