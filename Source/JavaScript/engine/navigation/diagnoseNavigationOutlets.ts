// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, OutletButton, OutletItem, OutletItemKind, OutletKind, OutletMode, OutletNavigationItem } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '../structure';
import { NavigationDiagnostic } from './NavigationDiagnostic';
import { NavigationDiagnosticCode } from './NavigationDiagnosticCode';
import { allowsSubItems, collectItemIds, findApplicationOutlet, modeOfRefinement, primarySlot } from './navigationOutlets';

/** What the navigation outlet diagnostics are checked against. */
export interface NavigationOutletDiagnosticOptions {
    /** The slots items may render into; just the primary slot, `content`, when absent. */
    slots?: string[];
}

/** One list of items a level puts in an outlet, with what it is checked against. */
interface ItemList {
    owner?: string;
    outlet: string;
    kind: OutletKind;
    items: OutletItem[];
    inherited: string[];
}

/**
 * Diagnoses the navigation outlets of an application against its structure: duplicate item ids, targets that are
 * missing, out of scope or lead nowhere, slots the layout does not declare, and buttons that open slices that do not
 * exist. The application's outlets are checked first, in the order they are declared, then each module in the order
 * they are declared - its refinements, then its contributions; items are visited depth first.
 *
 * Problems with the outlets themselves - a refinement of an outlet nobody declares, an item of the wrong kind, a hidden
 * item that is not there - are what {@link diagnoseOutlets} reports over {@link navigationOutletLevels}.
 *
 * The C# engine (`NavigationOutletDiagnostics`) reports the same codes and messages in the same order; both are
 * asserted against `navigation-inheritance-fixtures.json`, `navigation-targets-fixtures.json` and
 * `navigation-diagnostic-fixtures.json`.
 *
 * @param structure The modules, features and slices of the application.
 * @param navigation The application's outlets and how each module refines them.
 * @param options The slots items may render into.
 * @returns The problems found, in the order described.
 */
export function diagnoseNavigationOutlets(
    structure: ApplicationStructure | ApplicationStructureIndex,
    navigation: NavigationModel,
    options: NavigationOutletDiagnosticOptions = {},
): NavigationDiagnostic[] {
    const index = structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure);
    const slots = options.slots ?? [primarySlot];
    const diagnostics: NavigationDiagnostic[] = [];

    for (const outlet of navigation.application.outlets ?? []) {
        check(index, slots, diagnostics, { outlet: outlet.name, kind: outlet.kind, items: outlet.defaults, inherited: [] });
    }

    for (const moduleNavigation of navigation.modules) {
        for (const refinement of moduleNavigation.refinements ?? []) {
            const declared = findApplicationOutlet(navigation, refinement.outlet);
            if (!declared) continue;
            const inherited = modeOfRefinement(refinement) === OutletMode.Extends
                ? collectItemIds(declared.defaults, allowsSubItems(declared.name, declared.kind))
                : [];
            check(index, slots, diagnostics, { owner: moduleNavigation.module, outlet: declared.name, kind: declared.kind, items: refinement.items ?? [], inherited });
        }
        for (const contribution of moduleNavigation.contributions ?? []) {
            const declared = findApplicationOutlet(navigation, contribution.outlet);
            if (!declared) continue;
            check(index, slots, diagnostics, { owner: moduleNavigation.module, outlet: declared.name, kind: declared.kind, items: contribution.items, inherited: [] });
        }
    }
    return diagnostics;
}

function check(index: ApplicationStructureIndex, slots: string[], diagnostics: NavigationDiagnostic[], list: ItemList): void {
    const scope = list.owner === undefined ? 'the application' : `module '${list.owner}'`;
    const nested = allowsSubItems(list.outlet, list.kind);
    const seen = new Set<string>();
    const visit = (items: OutletItem[]): void => {
        for (const item of items) {
            const entry = `${list.owner ?? 'application'}:${list.outlet}:${item.id}`;
            const report = (code: NavigationDiagnosticCode, message: string): void => { diagnostics.push({ code, message, entry }); };
            const isItem = item.kind === OutletItemKind.Navigation;
            const what = isItem ? 'Navigation item' : 'Navigation button';
            if (seen.has(item.id)) {
                report(NavigationDiagnosticCode.NavDuplicateId, `${what} '${item.id}' is used more than once in ${scope} ${list.outlet}.`);
            } else if (list.inherited.includes(item.id)) {
                report(NavigationDiagnosticCode.NavDuplicateId, `${what} '${item.id}' in ${scope} ${list.outlet} is also used by an application ${isItem ? 'item' : 'button'}, and the module extends the application's.`);
            }
            seen.add(item.id);

            if (item.kind === OutletItemKind.Navigation) {
                checkItem(index, slots, list.owner, item, report);
                if (nested && item.children) visit(item.children);
            } else if (item.kind === OutletItemKind.Button) {
                checkButton(index, item, report);
            }
        }
    };
    visit(list.items);
}

function checkButton(index: ApplicationStructureIndex, button: OutletButton, report: (code: NavigationDiagnosticCode, message: string) => void): void {
    if (button.slice && !index.findSlice(button.slice)) {
        report(NavigationDiagnosticCode.NavTargetMissing, `Navigation button '${button.id}' opens slice '${button.slice}', which does not exist.`);
    }
}

function checkItem(
    index: ApplicationStructureIndex,
    slots: string[],
    owner: string | undefined,
    item: OutletNavigationItem,
    report: (code: NavigationDiagnosticCode, message: string) => void,
): void {
    checkTarget(index, owner, item, report);
    const slot = item.slot ?? primarySlot;
    if (!slots.includes(slot)) {
        report(NavigationDiagnosticCode.NavSlotUnknown, `Navigation item '${item.id}' renders into slot '${slot}', which the layout does not declare.`);
    }
}

function checkTarget(index: ApplicationStructureIndex, owner: string | undefined, item: OutletNavigationItem, report: (code: NavigationDiagnosticCode, message: string) => void): void {
    const module = item.target?.module;
    const hasChildren = (item.children?.length ?? 0) > 0;
    if (!module) {
        // An item that only groups sub-items needs no target of its own, and a screen target is resolved by the host.
        if (!hasChildren && item.target?.screen === undefined) report(NavigationDiagnosticCode.NavTargetMissing, `Navigation item '${item.id}' has no target.`);
        return;
    }
    if (!index.findModule(module)) {
        report(NavigationDiagnosticCode.NavTargetMissing, `Navigation item '${item.id}' targets module '${module}', which does not exist.`);
        return;
    }
    if (owner !== undefined && module !== owner) {
        report(NavigationDiagnosticCode.NavTargetOutOfScope, `Navigation item '${item.id}' of module '${owner}' targets module '${module}'; a module's own items may only target that module.`);
        return;
    }
    const feature = item.target?.feature;
    if (feature) {
        if (!index.findFeature(`${module}.${feature}`)) {
            report(NavigationDiagnosticCode.NavTargetMissing, `Navigation item '${item.id}' targets feature '${module}.${feature}', which does not exist.`);
        }
    } else if (!index.firstFeature(module)) {
        report(NavigationDiagnosticCode.NavModuleWithoutFeatures, `Navigation item '${item.id}' targets module '${module}', which has no features to go to.`);
    }
}
