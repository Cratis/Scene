// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, DestinationReference, Screen } from '@cratis/scene.model';
import { collectOutlets } from './collectOutlets';
import { findHostingCycles } from './findHostingCycles';
import { NavigationDiagnostic } from './NavigationDiagnostic';
import { NavigationDiagnosticCode } from './NavigationDiagnosticCode';
import { NavigationGraph } from './NavigationGraph';
import { NavigationRouteKey, authoredRouteKey, navigationTarget } from './navigationRoute';
import { OutletOwner } from './OutletOwner';

/**
 * Diagnoses how destinations, outlets, routes and targets fit together: duplicate routes, duplicate,
 * missing or incompatible outlets, hosting cycles and unavailable targets.
 *
 * Routes are compared by `routeKey` - by default the authored route override, since the engine constructs no
 * URLs. Nothing is rewritten. The C# engine (`NavigationDiagnostics.Diagnose`) reports the same codes and
 * messages in the same order for the same model; both are asserted against `navigation-diagnostic-fixtures.json`.
 */
export function diagnoseNavigation(graph: NavigationGraph, routeKey: NavigationRouteKey = authoredRouteKey): NavigationDiagnostic[] {
    const diagnostics: NavigationDiagnostic[] = [];
    const outlets = collectOutlets(graph, diagnostics);
    const screens = graph.screens ? new Map(graph.screens.map(screen => [screen.name, screen])) : undefined;
    const routes = new Map<string, { entry: string; target: string }>();
    const hostedIn = new Map<string, string[]>();

    graph.entries.forEach((navigationEntry, index) => {
        const entry = navigationEntry.id ?? `#${index + 1}`;
        const destination = navigationEntry.destination;
        const kind = destination.kind ?? (destination.dialog ? DestinationKind.Dialog : DestinationKind.Outlet);
        const report = (code: NavigationDiagnosticCode, message: string) => diagnostics.push({ code, message, entry });

        if (!destination.screen && !destination.module && !destination.route && !destination.dialog) {
            report(NavigationDiagnosticCode.UnavailableTarget, `Destination '${entry}' names no screen, stable identity, route or dialog.`);
            return;
        }

        diagnoseTarget(graph, screens, destination, kind, entry, report);
        const owner = diagnoseOutlet(graph, outlets, screens, destination, kind, entry, report);
        if (owner?.ownerKind === 'ScreenTemplate' && destination.screen && screens?.has(destination.screen)) {
            const hosts = graph.screens!.filter(screen => screen.screenTemplate === owner.owner).map(screen => screen.name);
            hostedIn.set(destination.screen, [...new Set([...(hostedIn.get(destination.screen) ?? []), ...hosts])]);
        }

        const route = kind === DestinationKind.External ? undefined : routeKey(destination);
        if (route) {
            const target = navigationTarget(destination, kind);
            const existing = routes.get(route);
            if (!existing) {
                routes.set(route, { entry, target });
            } else if (existing.target !== target) {
                report(NavigationDiagnosticCode.DuplicateRoute, `Route '${destination.route ?? route}' is used by destinations '${existing.entry}' and '${entry}', which open different targets.`);
            }
        }
    });

    for (const cycle of findHostingCycles(graph.screens?.map(screen => screen.name) ?? [], hostedIn)) {
        diagnostics.push({
            code: NavigationDiagnosticCode.NavigationCycle,
            message: `Navigation cycle ${[...cycle, cycle[0]].join(' -> ')}: each screen is placed in an outlet owned by the next, so composition never terminates.`,
        });
    }

    return diagnostics;
}

type Report = (code: NavigationDiagnosticCode, message: string) => void;

function diagnoseTarget(
    graph: NavigationGraph,
    screens: Map<string, Screen> | undefined,
    destination: DestinationReference,
    kind: DestinationKind,
    entry: string,
    report: Report,
) {
    if (kind === DestinationKind.Dialog) {
        if (!destination.dialog) {
            report(NavigationDiagnosticCode.UnavailableTarget, `Dialog destination '${entry}' names no dialog.`);
        } else if (graph.dialogTemplates && !graph.dialogTemplates.some(template => template.name === destination.dialog)) {
            report(NavigationDiagnosticCode.UnavailableTarget, `Destination '${entry}' opens dialog '${destination.dialog}', which no dialog template provides.`);
        }
        return;
    }

    if (kind === DestinationKind.Outlet && destination.screen && screens && !screens.has(destination.screen)) {
        report(NavigationDiagnosticCode.UnavailableTarget, `Destination '${entry}' opens screen '${destination.screen}', which does not exist.`);
    }
}

function diagnoseOutlet(
    graph: NavigationGraph,
    outlets: Map<string, OutletOwner>,
    screens: Map<string, Screen> | undefined,
    destination: DestinationReference,
    kind: DestinationKind,
    entry: string,
    report: Report,
): OutletOwner | undefined {
    if (!destination.outlet) return undefined;

    if (kind !== DestinationKind.Outlet) {
        const opens = kind === DestinationKind.Dialog ? 'a dialog' : 'an external target';
        report(NavigationDiagnosticCode.IncompatibleOutlet, `Destination '${entry}' opens ${opens} but names outlet '${destination.outlet}'; only outlet destinations render in outlets.`);
        return undefined;
    }

    const owner = outlets.get(destination.outlet);
    if (!owner) {
        report(NavigationDiagnosticCode.MissingOutlet, `Destination '${entry}' targets missing outlet '${destination.outlet}'.`);
        return undefined;
    }

    const screen = destination.screen ? screens?.get(destination.screen) : undefined;
    if (!screen) return owner;

    if (owner.ownerKind === 'Layout' && screen.layout !== owner.owner) {
        report(
            NavigationDiagnosticCode.IncompatibleOutlet,
            `Outlet '${owner.outlet.name}' belongs to layout '${owner.owner}', but destination '${entry}' places '${screen.name}', which renders in layout '${screen.layout}'.`,
        );
    }

    if (owner.outlet.accepts) {
        const type = graph.screenTemplates?.find(template => template.name === screen.screenTemplate)?.metadata?.type;
        if (!type || !owner.outlet.accepts.includes(type)) {
            report(
                NavigationDiagnosticCode.IncompatibleOutlet,
                `Outlet '${owner.outlet.name}' accepts ${owner.outlet.accepts.join(', ')} screens, but destination '${entry}' places '${screen.name}' of type '${type ?? 'untyped'}'.`,
            );
        }
    }

    return owner;
}
