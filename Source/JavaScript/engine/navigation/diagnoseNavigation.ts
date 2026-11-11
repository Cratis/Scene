// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, DestinationReference, Screen } from '@cratis/scene.model';
import { collectSlots } from './collectSlots';
import { diagnoseNavigationOutlets } from './diagnoseNavigationOutlets';
import { findHostingCycles } from './findHostingCycles';
import { NavigationDiagnostic } from './NavigationDiagnostic';
import { NavigationDiagnosticCode } from './NavigationDiagnosticCode';
import { NavigationGraph } from './NavigationGraph';
import { NavigationRouteKey, authoredRouteKey, navigationTarget } from './navigationRoute';
import { SlotOwner } from './SlotOwner';

/**
 * Diagnoses how destinations, slots, routes and targets fit together: duplicate routes, duplicate,
 * missing or incompatible slots, hosting cycles and unavailable targets.
 *
 * Routes are compared by `routeKey` - by default the authored route override, since the engine constructs no
 * URLs. Nothing is rewritten. The C# engine (`NavigationDiagnostics.Diagnose`) reports the same codes and
 * messages in the same order for the same model; both are asserted against `navigation-diagnostic-fixtures.json`. When the graph carries
 * an application `structure` and `navigation`, the navigation outlets are checked too ({@link diagnoseNavigationOutlets}).
 */
export function diagnoseNavigation(graph: NavigationGraph, routeKey: NavigationRouteKey = authoredRouteKey): NavigationDiagnostic[] {
    const diagnostics: NavigationDiagnostic[] = [];
    const run: DiagnosisRun = {
        graph,
        routeKey,
        diagnostics,
        slots: collectSlots(graph, diagnostics),
        screens: graph.screens ? new Map(graph.screens.map(screen => [screen.name, screen])) : undefined,
        routes: new Map(),
        hostedIn: new Map(),
    };

    graph.entries.forEach((navigationEntry, index) => diagnoseEntry(run, navigationEntry, index));

    for (const cycle of findHostingCycles(graph.screens?.map(screen => screen.name) ?? [], run.hostedIn)) {
        diagnostics.push({
            code: NavigationDiagnosticCode.NavigationCycle,
            message: `Navigation cycle ${[...cycle, cycle[0]].join(' -> ')}: each screen is placed in a slot owned by the next, so composition never terminates.`,
        });
    }

    if (graph.structure && graph.navigation) {
        diagnostics.push(...diagnoseNavigationOutlets(graph.structure, graph.navigation, { slots: graph.slots }));
    }

    return diagnostics;
}

type Report = (code: NavigationDiagnosticCode, message: string) => void;

/** Everything diagnosing a graph builds up as it goes through the entries. */
interface DiagnosisRun {
    graph: NavigationGraph;
    routeKey: NavigationRouteKey;
    diagnostics: NavigationDiagnostic[];
    slots: Map<string, SlotOwner>;
    screens: Map<string, Screen> | undefined;
    routes: Map<string, { entry: string; target: string }>;
    hostedIn: Map<string, string[]>;
}

function diagnoseEntry(run: DiagnosisRun, navigationEntry: NavigationGraph['entries'][number], index: number): void {
    const { graph, screens, routes, hostedIn, routeKey } = run;
    const entry = navigationEntry.id ?? `#${index + 1}`;
    const destination = navigationEntry.destination;
    const kind = destination.kind ?? (destination.dialog ? DestinationKind.Dialog : DestinationKind.Slot);
    const report = (code: NavigationDiagnosticCode, message: string) => run.diagnostics.push({ code, message, entry });

    if (namesNoTarget(destination)) {
        report(NavigationDiagnosticCode.UnavailableTarget, `Destination '${entry}' names no screen, stable identity, route or dialog.`);
        return;
    }

    const placement: Placement = { graph, screens, destination, kind, entry, report };
    diagnoseTarget(placement);
    const owner = diagnoseSlot(placement, run.slots);
    if (owner?.ownerKind === 'ScreenTemplate' && destination.screen && screens?.has(destination.screen)) {
        recordHosts(graph, owner, destination.screen, hostedIn);
    }

    const route = kind === DestinationKind.External ? undefined : routeKey(destination);
    if (route) {
        const conflict = claimRoute(routes, route, { entry, target: navigationTarget(destination, kind) }, destination.route ?? route);
        if (conflict) report(NavigationDiagnosticCode.DuplicateRoute, conflict);
    }
}

/** A destination with what it is checked against and where to report what is wrong with it. */
interface Placement {
    graph: NavigationGraph;
    screens: Map<string, Screen> | undefined;
    destination: DestinationReference;
    kind: DestinationKind;
    entry: string;
    report: Report;
}

function namesNoTarget(destination: DestinationReference): boolean {
    return !destination.screen && !destination.module && !destination.route && !destination.dialog;
}

function recordHosts(graph: NavigationGraph, owner: SlotOwner, screen: string, hostedIn: Map<string, string[]>): void {
    const hosts = graph.screens!.filter(candidate => candidate.screenTemplate === owner.owner).map(candidate => candidate.name);
    hostedIn.set(screen, [...new Set([...(hostedIn.get(screen) ?? []), ...hosts])]);
}

/** Claims the route for a destination; says what is wrong when another destination that opens something else already has it. */
function claimRoute(routes: Map<string, { entry: string; target: string }>, route: string, claim: { entry: string; target: string }, shown: string): string | undefined {
    const existing = routes.get(route);
    if (!existing) {
        routes.set(route, claim);
        return undefined;
    }
    return existing.target === claim.target
        ? undefined
        : `Route '${shown}' is used by destinations '${existing.entry}' and '${claim.entry}', which open different targets.`;
}

function diagnoseTarget(placement: Placement) {
    const { screens, destination, kind, entry, report } = placement;
    if (kind === DestinationKind.Dialog) {
        diagnoseDialogTarget(placement);
        return;
    }

    if (kind === DestinationKind.Slot && opensMissingScreen(destination, screens)) {
        report(NavigationDiagnosticCode.UnavailableTarget, `Destination '${entry}' opens screen '${destination.screen}', which does not exist.`);
    }
}

function opensMissingScreen(destination: DestinationReference, screens: Map<string, Screen> | undefined): boolean {
    return !!destination.screen && !!screens && !screens.has(destination.screen);
}

function diagnoseDialogTarget({ graph, destination, entry, report }: Placement) {
    if (!destination.dialog) {
        report(NavigationDiagnosticCode.UnavailableTarget, `Dialog destination '${entry}' names no dialog.`);
    } else if (graph.dialogTemplates && !graph.dialogTemplates.some(template => template.name === destination.dialog)) {
        report(NavigationDiagnosticCode.UnavailableTarget, `Destination '${entry}' opens dialog '${destination.dialog}', which no dialog template provides.`);
    }
}

function diagnoseSlot(placement: Placement, slots: Map<string, SlotOwner>): SlotOwner | undefined {
    const { screens, destination, kind, entry, report } = placement;
    if (!destination.slot) return undefined;

    if (kind !== DestinationKind.Slot) {
        const opens = kind === DestinationKind.Dialog ? 'a dialog' : 'an external target';
        report(NavigationDiagnosticCode.IncompatibleSlot, `Destination '${entry}' opens ${opens} but names slot '${destination.slot}'; only slot destinations render in slots.`);
        return undefined;
    }

    const owner = slots.get(destination.slot);
    if (!owner) {
        report(NavigationDiagnosticCode.MissingSlot, `Destination '${entry}' targets missing slot '${destination.slot}'.`);
        return undefined;
    }

    const screen = destination.screen ? screens?.get(destination.screen) : undefined;
    if (screen) diagnosePlacedScreen(placement, owner, screen);
    return owner;
}

function diagnosePlacedScreen({ graph, entry, report }: Placement, owner: SlotOwner, screen: Screen): void {
    if (owner.ownerKind === 'Layout' && screen.layout !== owner.owner) {
        report(
            NavigationDiagnosticCode.IncompatibleSlot,
            `Slot '${owner.slot.name}' belongs to layout '${owner.owner}', but destination '${entry}' places '${screen.name}', which renders in layout '${screen.layout}'.`,
        );
    }

    if (!owner.slot.accepts) return;
    const type = graph.screenTemplates?.find(template => template.name === screen.screenTemplate)?.metadata?.type;
    if (!type || !owner.slot.accepts.includes(type)) {
        report(
            NavigationDiagnosticCode.IncompatibleSlot,
            `Slot '${owner.slot.name}' accepts ${owner.slot.accepts.join(', ')} screens, but destination '${entry}' places '${screen.name}' of type '${type ?? 'untyped'}'.`,
        );
    }
}
