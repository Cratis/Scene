// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegion, NavigationRegionKind, NavigationRegionMode, NavItem } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '../structure';
import { NavigationDiagnostic } from './NavigationDiagnostic';
import { NavigationDiagnosticCode } from './NavigationDiagnosticCode';
import { applicationItems, collectItemIds, findNavigationRegion, navigationRegionOrder, ownButtons, primarySlot } from './navigationRegions';

/** What the region diagnostics are checked against. */
export interface NavigationRegionDiagnosticOptions {
    /** The rendering slots items may render into; `content` only when absent. */
    slots?: string[];
}

/**
 * Diagnoses the navigation regions of an application against its structure: duplicate item ids, targets that are
 * missing, out of scope or lead nowhere, and slots the layout does not declare. The application is checked first,
 * then each module in the order they are declared; within a level the topbar comes before the sidebar and items are
 * visited depth first.
 *
 * The C# engine (`NavigationRegionDiagnostics`) reports the same codes and messages in the same order; both are
 * asserted against `navigation-inheritance-fixtures.json`, `navigation-targets-fixtures.json` and
 * `navigation-diagnostic-fixtures.json`.
 *
 * @param structure The modules, features and slices of the application.
 * @param navigation The application and module regions.
 * @param options The slots items may render into.
 */
export function diagnoseNavigationRegions(
    structure: ApplicationStructure | ApplicationStructureIndex,
    navigation: NavigationModel,
    options: NavigationRegionDiagnosticOptions = {},
): NavigationDiagnostic[] {
    const index = structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure);
    const slots = options.slots ?? [primarySlot];
    const diagnostics: NavigationDiagnostic[] = [];

    for (const region of navigationRegionOrder) {
        const defined = findNavigationRegion(navigation.application.regions, region);
        if (defined) checkRegion(index, slots, diagnostics, undefined, defined, [], []);
    }

    for (const moduleNavigation of navigation.modules) {
        for (const region of navigationRegionOrder) {
            const defined = findNavigationRegion(moduleNavigation.regions, region);
            if (!defined) continue;

            const inherited = defined.mode === NavigationRegionMode.Extend ? collectItemIds(applicationItems(navigation.application, region), region) : [];
            const inheritedButtons = defined.mode === NavigationRegionMode.Extend ? ownButtons(navigation, undefined, region).map(button => button.id) : [];
            checkRegion(index, slots, diagnostics, moduleNavigation.module, defined, inherited, inheritedButtons);
        }
    }

    return diagnostics;
}

function checkRegion(
    index: ApplicationStructureIndex,
    slots: string[],
    diagnostics: NavigationDiagnostic[],
    owner: string | undefined,
    defined: NavigationRegion,
    applicationIds: string[],
    applicationButtonIds: string[],
): void {
    const scope = owner === undefined ? 'the application' : `module '${owner}'`;
    const seen = new Set<string>();

    const visit = (items: NavItem[]): void => {
        for (const item of items) {
            const entry = `${owner ?? 'application'}:${defined.region}:${item.id}`;
            const report = (code: NavigationDiagnosticCode, message: string): void => { diagnostics.push({ code, message, entry }); };

            if (seen.has(item.id)) {
                report(NavigationDiagnosticCode.NavDuplicateId, `Navigation item '${item.id}' is used more than once in ${scope} ${defined.region}.`);
            } else if (applicationIds.includes(item.id)) {
                report(NavigationDiagnosticCode.NavDuplicateId, `Navigation item '${item.id}' in ${scope} ${defined.region} is also used by an application item, and the region extends the application.`);
            }
            seen.add(item.id);

            checkTarget(index, owner, item, report);

            const slot = item.slot ?? primarySlot;
            if (!slots.includes(slot)) {
                report(NavigationDiagnosticCode.NavSlotUnknown, `Navigation item '${item.id}' renders into slot '${slot}', which the layout does not declare.`);
            }

            if (defined.region === NavigationRegionKind.Sidebar && item.children) visit(item.children);
        }
    };

    visit(defined.items);
    checkButtons(index, diagnostics, owner, scope, defined, applicationButtonIds);
}

function checkButtons(
    index: ApplicationStructureIndex,
    diagnostics: NavigationDiagnostic[],
    owner: string | undefined,
    scope: string,
    defined: NavigationRegion,
    applicationButtonIds: string[],
): void {
    const seen = new Set<string>();
    for (const button of defined.buttons ?? []) {
        const entry = `${owner ?? 'application'}:${defined.region}:button:${button.id}`;

        if (seen.has(button.id)) {
            diagnostics.push({ code: NavigationDiagnosticCode.NavDuplicateId, message: `Navigation button '${button.id}' is used more than once in ${scope} ${defined.region}.`, entry });
        } else if (applicationButtonIds.includes(button.id)) {
            diagnostics.push({ code: NavigationDiagnosticCode.NavDuplicateId, message: `Navigation button '${button.id}' in ${scope} ${defined.region} is also used by an application button, and the region extends the application.`, entry });
        }
        seen.add(button.id);

        if (button.slice && !index.findSlice(button.slice)) {
            diagnostics.push({ code: NavigationDiagnosticCode.NavTargetMissing, message: `Navigation button '${button.id}' opens slice '${button.slice}', which does not exist.`, entry });
        }
    }
}

function checkTarget(index: ApplicationStructureIndex, owner: string | undefined, item: NavItem, report: (code: NavigationDiagnosticCode, message: string) => void): void {
    const module = item.target?.module;
    const hasChildren = (item.children?.length ?? 0) > 0;

    if (!module) {
        // A sidebar item that only groups sub-items needs no target of its own.
        if (!hasChildren) report(NavigationDiagnosticCode.NavTargetMissing, `Navigation item '${item.id}' has no target.`);
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
