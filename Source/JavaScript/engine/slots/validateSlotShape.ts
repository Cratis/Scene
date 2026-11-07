// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletItemKind, OutletKind, ScreenFit, SlotRole } from '@cratis/scene.model';
import { actionPresentationMigrationHint, isLegacyActionPresentation, legacyActionPresentationProperty } from './upgradeActionPresentation';
import { SlotShapeDiagnostic } from './SlotShapeDiagnostic';
import { SlotShapeDiagnosticCode } from './SlotShapeDiagnosticCode';
import { isLegacyNavigationContribution, isLegacyNavigationModel } from './upgradeNavigationShape';
import { isLegacyToolbarElement, toolbarElementMigrationHint } from './upgradeToolbarElement';
import { isLegacyDestination, isLegacyDestinationKind, isLegacyOutletList, isLegacyToolbar, legacyOutletComponentName } from './upgradeSlotShape';

type JsonObject = { [key: string]: unknown };

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const roles = new Set<string>(Object.values(SlotRole));

/** The sentence every legacy-shape diagnostic ends with: how to get out of it. */
export const slotShapeMigrationHint = 'Scene 5 replaced outlets with slots: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source';

/**
 * Checks that a stored Scene document - a whole document, a template library, or a single layout or screen template - is in
 * the slot shape: nothing left of the outlet shape, every slot role known, route parameters only on routed slots, and at
 * most one primary slot per layout or screen template. The C# engine runs the same check on save (`SlotShapeValidator`).
 * @param document The stored document, parsed from JSON.
 * @returns What is wrong, in document order; empty when the document is in the slot shape.
 */
export function validateSlotShape(document: unknown): SlotShapeDiagnostic[] {
    const diagnostics: SlotShapeDiagnostic[] = [];
    visit(document, '$', diagnostics);
    return diagnostics;
}

function visit(value: unknown, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, `${path}[${index}]`, diagnostics));
        return;
    }

    if (!isObject(value)) return;

    checkLegacy(value, path, diagnostics);
    checkSlots(value, path, diagnostics);
    checkOutlets(value, path, diagnostics);
    checkNavigation(value, path, diagnostics);
    checkPlacement(value, path, diagnostics);

    for (const [key, child] of Object.entries(value)) {
        visit(child, `${path}.${key}`, diagnostics);
    }
}

function legacy(path: string, what: string): SlotShapeDiagnostic {
    return { code: SlotShapeDiagnosticCode.LegacyOutletShape, path, message: `${what}. ${slotShapeMigrationHint}` };
}

function checkLegacy(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    const name = typeof value.name === 'string' ? `'${value.name}'` : 'The object';
    if (isLegacyOutletList(value.outlets)) {
        diagnostics.push(legacy(`${path}.outlets`, `${name} declares outlets`));
    }

    if (isObject(value.metadata) && typeof value.metadata.primaryOutlet === 'string') {
        diagnostics.push(legacy(`${path}.metadata.primaryOutlet`, `${name} names its primary outlet in its metadata`));
    }

    if (isLegacyDestinationKind(value.kind)) {
        diagnostics.push(legacy(`${path}.kind`, `A destination opens the kind '${String(value.kind)}'`));
    }

    if (value.componentName === legacyOutletComponentName) {
        diagnostics.push(legacy(`${path}.componentName`, `A screen declares a nested outlet with '${legacyOutletComponentName}'`));
    }

    if (isLegacyDestination(value)) {
        diagnostics.push(legacy(`${path}.outlet`, `A destination names the outlet '${String(value.outlet)}'`));
    }

    if (isLegacyToolbarElement(value)) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.LegacyToolbarElement,
            path: `${path}.componentName`,
            message: `The element '${String(value.id)}' is a ${String(value.componentName)}. ${toolbarElementMigrationHint}`,
        });
    }
}

const outletKinds = new Set<string>(Object.values(OutletKind));
const opensValues = new Set<string>(Object.values(Opens));
const screenFits = new Set<string>(Object.values(ScreenFit));
const actionItemKinds = new Set<string>([OutletItemKind.Button, OutletItemKind.MenuEntry].map(kind => kind.toLowerCase()));

function actionOf(value: JsonObject, path: string): { action: JsonObject; path: string; name: string } | undefined {
    if (typeof value.componentName === 'string' && value.componentName.endsWith(':action') && isObject(value.properties)) {
        return { action: value.properties, path: `${path}.properties`, name: String(value.id) };
    }
    if (typeof value.kind === 'string' && actionItemKinds.has(value.kind.toLowerCase())) return { action: value, path, name: String(value.id) };
    return undefined;
}

function checkPlacement(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (isLegacyActionPresentation(value)) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.LegacyActionPresentation,
            path: `${path}.properties.${legacyActionPresentationProperty}`,
            message: `The action '${String(value.id)}' stores a presentation. ${actionPresentationMigrationHint}`,
        });
    }

    const found = actionOf(value, path);
    if (found !== undefined) {
        const opens = found.action.opens;
        if (opens !== undefined && (typeof opens !== 'string' || !opensValues.has(opens.toLowerCase()))) {
            diagnostics.push({
                code: SlotShapeDiagnosticCode.UnknownOpens,
                path: `${found.path}.opens`,
                message: `The action '${found.name}' opens '${String(opens)}'; an action opens automatically, runs directly (none), or opens in a dialog, a drawer or a slot`,
            });
        }
        if (typeof opens === 'string' && opens.toLowerCase() === Opens.Slot && (typeof found.action.opensIn !== 'string' || found.action.opensIn.length === 0)) {
            diagnostics.push({
                code: SlotShapeDiagnosticCode.OpensSlotWithoutName,
                path: `${found.path}.opensIn`,
                message: `The action '${found.name}' opens in a slot but does not name one`,
            });
        }
    }

    if (!Array.isArray(value.fits)) return;
    const name = typeof value.name === 'string' ? value.name : '(unnamed)';
    value.fits.forEach((fit: unknown, index: number) => {
        if (typeof fit === 'string' && screenFits.has(fit.toLowerCase())) return;
        diagnostics.push({
            code: SlotShapeDiagnosticCode.UnknownScreenFit,
            path: `${path}.fits[${index}]`,
            message: `The screen '${name}' fits '${String(fit)}'; a screen fits a dialog, a drawer, a pane, a panel or a page`,
        });
    });
}

/** What the validator tells a document that still has a feature or module toolbar. */
export const toolbarShapeMigrationHint = 'Scene 5 replaced feature and module toolbars with the toolbar outlet: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source';

/** What a stored navigation model or navigation contribution in the shape Scene 5 replaced is told to do. */
export const navigationShapeMigrationHint = 'Scene 5 replaced navigation regions and navigation contribution points with outlets of navigation: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source';

function checkNavigation(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (isLegacyNavigationModel(owner)) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.LegacyNavigationShape,
            path: `${path}.application.regions`,
            message: `The navigation lists regions. ${navigationShapeMigrationHint}`,
        });
    }
    if (!Array.isArray(owner.contributions)) return;
    owner.contributions.forEach((contribution: unknown, index: number) => {
        if (!isLegacyNavigationContribution(contribution)) return;
        diagnostics.push({
            code: SlotShapeDiagnosticCode.LegacyNavigationContribution,
            path: `${path}.contributions[${index}]`,
            message: `A navigation item is contributed to the contribution point '${String(contribution.contributionPointName)}'. ${navigationShapeMigrationHint}`,
        });
    });
}

function checkOutlets(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    const ownerName = typeof owner.name === 'string' ? owner.name : '(unnamed)';
    if (isLegacyToolbar(owner.toolbar)) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.LegacyToolbarShape,
            path: `${path}.toolbar`,
            message: `'${ownerName}' has a toolbar whose buttons every screen gets. ${toolbarShapeMigrationHint}`,
        });
    }
    if (!Array.isArray(owner.outlets) || isLegacyOutletList(owner.outlets)) return;
    owner.outlets.forEach((outlet: unknown, index: number) => {
        if (!isObject(outlet) || typeof outlet.name !== 'string') return;
        if (typeof outlet.kind === 'string' && outletKinds.has(outlet.kind.toLowerCase())) return;
        const kind = outlet.kind === undefined ? 'no kind' : `the kind '${String(outlet.kind)}'`;
        diagnostics.push({
            code: SlotShapeDiagnosticCode.UnknownOutletKind,
            path: `${path}.outlets[${index}].kind`,
            message: `The outlet '${outlet.name}' of '${ownerName}' has ${kind}; an outlet lists actions, filters, tabs, stats or navigation`,
        });
    });
}

function checkSlots(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (!Array.isArray(owner.slots)) return;

    const ownerName = typeof owner.name === 'string' ? owner.name : '(unnamed)';
    const primaries: string[] = [];
    owner.slots.forEach((slot: unknown, index: number) => {
        if (!isObject(slot) || typeof slot.name !== 'string') return;
        const slotPath = `${path}.slots[${index}]`;

        if (slot.role !== undefined && (typeof slot.role !== 'string' || !roles.has(slot.role.toLowerCase()))) {
            diagnostics.push({
                code: SlotShapeDiagnosticCode.UnknownSlotRole,
                path: `${slotPath}.role`,
                message: `The slot '${slot.name}' of '${ownerName}' has the role '${String(slot.role)}'; a slot is a page, a pane or a panel`,
            });
        }

        if (Array.isArray(slot.routedBy) && slot.routedBy.length > 0 && slot.routed !== true) {
            diagnostics.push({
                code: SlotShapeDiagnosticCode.RouteParametersWithoutRouting,
                path: `${slotPath}.routedBy`,
                message: `The slot '${slot.name}' of '${ownerName}' is routed by ${slot.routedBy.map(String).join(', ')} but is not routed`,
            });
        }

        if (slot.primary === true) primaries.push(slot.name);
    });

    if (primaries.length > 1) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.MultiplePrimarySlots,
            path: `${path}.slots`,
            message: `'${ownerName}' marks ${primaries.map(name => `'${name}'`).join(', ')} as primary; only one slot can be`,
        });
    }
}
