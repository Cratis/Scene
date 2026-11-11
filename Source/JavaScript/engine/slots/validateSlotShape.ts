// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletButtonDisplay, OutletItemKind, OutletKind, ScreenFit, SlotRole } from '@cratis/scene.model';
import { actionPresentationMigrationHint, isLegacyActionPresentation, legacyActionPresentationProperty } from './upgradeActionPresentation';
import { describeOutletItemKinds, groupItemKinds, outletItemKindName, outletItemKinds } from '../outlets/outletItemKinds';
import { SlotShapeDiagnostic } from './SlotShapeDiagnostic';
import { SlotShapeDiagnosticCode } from './SlotShapeDiagnosticCode';
import { isLegacyNavigationContribution, isLegacyNavigationModel } from './upgradeNavigationShape';
import { isLegacyToolbarElement, toolbarElementMigrationHint } from './upgradeToolbarElement';
import { holdsUserValues, isDestinationOfLegacyKind, isLegacyDestination, isLegacyOutletList, isLegacyToolbar, legacyOutletComponentName } from './upgradeSlotShape';

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

function visit(value: unknown, path: string, diagnostics: SlotShapeDiagnostic[], inValues = false): void {
    if (Array.isArray(value)) {
        value.forEach((item, index) => visit(item, `${path}[${index}]`, diagnostics, inValues));
        return;
    }

    if (!isObject(value)) return;

    checkLegacy(value, path, diagnostics, inValues);
    if (!inValues) {
        checkSlots(value, path, diagnostics);
        checkOutlets(value, path, diagnostics);
        checkNavigation(value, path, diagnostics);
    }
    if (!inValues || typeof value.componentName === 'string') checkPlacement(value, path, diagnostics);

    for (const [key, child] of Object.entries(value)) {
        visit(child, `${path}.${key}`, diagnostics, inValues || holdsUserValues(value, key));
    }
}

function legacy(path: string, what: string): SlotShapeDiagnostic {
    return { code: SlotShapeDiagnosticCode.LegacyOutletShape, path, message: `${what}. ${slotShapeMigrationHint}` };
}

function checkOutletDeclarations(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    const name = typeof value.name === 'string' ? `'${value.name}'` : 'The object';
    if (isLegacyOutletList(value.outlets)) {
        diagnostics.push(legacy(`${path}.outlets`, `${name} declares outlets`));
    }

    if (isObject(value.metadata) && typeof value.metadata.primaryOutlet === 'string') {
        diagnostics.push(legacy(`${path}.metadata.primaryOutlet`, `${name} names its primary outlet in its metadata`));
    }
}

function checkLegacy(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[], inValues: boolean): void {
    if (!inValues) checkOutletDeclarations(value, path, diagnostics);

    if (isDestinationOfLegacyKind(value)) {
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

const opensValues = new Set<string>(Object.values(Opens));
const screenFits = new Set<string>(Object.values(ScreenFit));
const buttonDisplays = new Set<string>(Object.values(OutletButtonDisplay).map(display => display.toLowerCase()));
const actionItemKinds = new Set<string>([OutletItemKind.Button, OutletItemKind.MenuEntry].map(kind => kind.toLowerCase()));

function isActionComponent(value: JsonObject): boolean {
    return typeof value.componentName === 'string' && value.componentName.endsWith(':action');
}

function isActionItem(value: JsonObject): boolean {
    return typeof value.kind === 'string' && actionItemKinds.has(value.kind.toLowerCase());
}

function actionOf(value: JsonObject, path: string): { action: JsonObject; path: string; name: string } | undefined {
    if (isActionComponent(value) && isObject(value.properties)) {
        return { action: value.properties, path: `${path}.properties`, name: String(value.id) };
    }
    if (isActionItem(value)) return { action: value, path, name: String(value.id) };
    return undefined;
}

function isUnknownOpens(opens: unknown): boolean {
    return opens !== undefined && (typeof opens !== 'string' || !opensValues.has(opens.toLowerCase()));
}

function opensSlotWithoutName(opens: unknown, action: JsonObject): boolean {
    const opensSlot = typeof opens === 'string' && opens.toLowerCase() === Opens.Slot;
    return opensSlot && (typeof action.opensIn !== 'string' || action.opensIn.length === 0);
}

function checkActionPresentation(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (!isLegacyActionPresentation(value)) return;
    diagnostics.push({
        code: SlotShapeDiagnosticCode.LegacyActionPresentation,
        path: `${path}.properties.${legacyActionPresentationProperty}`,
        message: `The action '${String(value.id)}' stores a presentation. ${actionPresentationMigrationHint}`,
    });
}

function checkActionOpens(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    const found = actionOf(value, path);
    if (found === undefined) return;

    const opens = found.action.opens;
    if (isUnknownOpens(opens)) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.UnknownOpens,
            path: `${found.path}.opens`,
            message: `The action '${found.name}' opens '${String(opens)}'; an action opens automatically, runs directly (none), or opens in a dialog, a drawer or a slot`,
        });
    }
    if (opensSlotWithoutName(opens, found.action)) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.OpensSlotWithoutName,
            path: `${found.path}.opensIn`,
            message: `The action '${found.name}' opens in a slot but does not name one`,
        });
    }
}

function isButton(value: JsonObject): boolean {
    return typeof value.kind === 'string' && value.kind.toLowerCase() === OutletItemKind.Button;
}

function isUnknownButtonDisplay(display: unknown): boolean {
    return display !== undefined && (typeof display !== 'string' || !buttonDisplays.has(display.toLowerCase()));
}

function checkButtonDisplay(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    const display = value.display;
    if (!isButton(value) || !isUnknownButtonDisplay(display)) return;
    diagnostics.push({
        code: SlotShapeDiagnosticCode.UnknownButtonDisplay,
        path: `${path}.display`,
        message: `The button '${String(value.id)}' shows '${String(display)}'; a button shows its icon and title (iconAndTitle), only its icon (icon) or only its title (title)`,
    });
}

function checkPlacement(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    checkActionPresentation(value, path, diagnostics);
    checkActionOpens(value, path, diagnostics);
    checkButtonDisplay(value, path, diagnostics);
    checkScreenFits(value, path, diagnostics);
}

function checkScreenFits(value: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
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

function ownerNameOf(owner: JsonObject): string {
    return typeof owner.name === 'string' ? owner.name : '(unnamed)';
}

function checkToolbar(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (!isLegacyToolbar(owner.toolbar)) return;
    diagnostics.push({
        code: SlotShapeDiagnosticCode.LegacyToolbarShape,
        path: `${path}.toolbar`,
        message: `'${ownerNameOf(owner)}' has a toolbar whose buttons every screen gets. ${toolbarShapeMigrationHint}`,
    });
}

function isOutletItemList(entry: unknown): entry is { outlet: string; items: unknown[] } {
    return isObject(entry) && typeof entry.outlet === 'string' && Array.isArray(entry.items);
}

function checkOutletItemLists(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    for (const key of outletItemListKeys) {
        if (!Array.isArray(owner[key])) continue;
        (owner[key] as unknown[]).forEach((entry, index) => {
            if (!isOutletItemList(entry)) return;
            checkOutletItems(entry.items, { outlet: entry.outlet }, `${path}.${key}[${index}].items`, diagnostics);
        });
    }
}

function checkOutlet(outlet: unknown, ownerName: string, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (!isObject(outlet) || typeof outlet.name !== 'string') return;
    const written = typeof outlet.kind === 'string' ? outlet.kind.toLowerCase() : undefined;
    const kind = Object.values(OutletKind).find(candidate => candidate === written);
    if (kind !== undefined) {
        if (Array.isArray(outlet.defaults)) checkOutletItems(outlet.defaults, { outlet: outlet.name, kind }, `${path}.defaults`, diagnostics);
        return;
    }
    const described = outlet.kind === undefined ? 'no kind' : `the kind '${String(outlet.kind)}'`;
    diagnostics.push({
        code: SlotShapeDiagnosticCode.UnknownOutletKind,
        path: `${path}.kind`,
        message: `The outlet '${outlet.name}' of '${ownerName}' has ${described}; an outlet lists actions, filters, tabs, stats or navigation`,
    });
}

function checkOutlets(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    checkToolbar(owner, path, diagnostics);
    checkOutletItemLists(owner, path, diagnostics);

    if (!Array.isArray(owner.outlets) || isLegacyOutletList(owner.outlets)) return;
    const ownerName = ownerNameOf(owner);
    owner.outlets.forEach((outlet: unknown, index: number) => checkOutlet(outlet, ownerName, `${path}.outlets[${index}]`, diagnostics));
}

/** The keys of an owner that list refinements of, or contributions to, outlets: each entry names its `outlet` and has `items`. */
const outletItemListKeys = ['refinements', 'contributions', 'outletContributions'];

interface OutletItemsOwner {
    outlet: string;
    kind?: OutletKind;
    group?: string;
}

interface OutletItemContext {
    item: JsonObject;
    itemPath: string;
    id: string | undefined;
    named: string;
    owner: OutletItemsOwner;
    diagnostics: SlotShapeDiagnostic[];
}

function kindOfItem(item: JsonObject): OutletItemKind | undefined {
    const written = typeof item.kind === 'string' ? item.kind.toLowerCase() : undefined;
    return Object.values(OutletItemKind).find(candidate => candidate.toLowerCase() === written);
}

function reportUnknownItemKind(context: OutletItemContext): void {
    const { item, itemPath, named, owner } = context;
    const described = item.kind === undefined ? 'no kind' : `the kind '${String(item.kind)}'`;
    context.diagnostics.push({
        code: SlotShapeDiagnosticCode.UnknownOutletItemKind,
        path: `${itemPath}.kind`,
        message: `The item '${named}' of the outlet '${owner.outlet}' has ${described}; an outlet item is a button, menu entry, separator, group, filter, tab, stat or navigation item`,
    });
}

function reportMismatchedItemKind(context: OutletItemContext, kind: OutletItemKind): boolean {
    const { itemPath, named, owner } = context;
    const allowed = owner.group !== undefined ? groupItemKinds : owner.kind !== undefined ? outletItemKinds(owner.kind) : undefined;
    if (allowed === undefined || allowed.includes(kind)) return false;

    const name = outletItemKindName(kind);
    context.diagnostics.push({
        code: SlotShapeDiagnosticCode.OutletItemKindMismatch,
        path: `${itemPath}.kind`,
        message: owner.group !== undefined
            ? `The ${name} '${named}' cannot go in the group '${owner.group}' of the outlet '${owner.outlet}', which takes buttons, menu entries and separators`
            : `The ${name} '${named}' cannot go in the ${owner.kind} outlet '${owner.outlet}', which takes ${describeOutletItemKinds(owner.kind!)}`,
    });
    return true;
}

function isBlank(value: unknown): boolean {
    return typeof value !== 'string' || value.length === 0;
}

function checkOutletItemCompleteness(context: OutletItemContext, kind: OutletItemKind): void {
    const { item, itemPath, id, named, owner } = context;
    const name = outletItemKindName(kind);
    const incomplete = (field: string, what: string) => context.diagnostics.push({
        code: SlotShapeDiagnosticCode.IncompleteOutletItem,
        path: `${itemPath}.${field}`,
        message: `The ${name} '${named}' of the outlet '${owner.outlet}' has no ${what}`,
    });
    if (id === undefined) incomplete('id', 'id');
    if (kind !== OutletItemKind.Separator && isBlank(item.title)) incomplete('title', 'title');
    if (kind === OutletItemKind.Tab && isBlank(item.shows)) incomplete('shows', 'screen to show');
    if (kind !== OutletItemKind.Group) return;

    if (!Array.isArray(item.items)) incomplete('items', 'items');
    else checkOutletItems(item.items, { ...owner, group: named }, `${itemPath}.items`, context.diagnostics);
}

function checkOutletItem(item: unknown, itemPath: string, owner: OutletItemsOwner, diagnostics: SlotShapeDiagnostic[]): void {
    if (!isObject(item)) return;
    const id = typeof item.id === 'string' && item.id.length > 0 ? item.id : undefined;
    const context: OutletItemContext = { item, itemPath, id, named: id ?? '(no id)', owner, diagnostics };
    const kind = kindOfItem(item);
    if (kind === undefined) {
        reportUnknownItemKind(context);
        return;
    }

    if (reportMismatchedItemKind(context, kind)) return;
    checkOutletItemCompleteness(context, kind);
}

function checkOutletItems(items: unknown[], owner: OutletItemsOwner, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    items.forEach((item, index) => checkOutletItem(item, `${path}[${index}]`, owner, diagnostics));
}

interface SlotContext {
    slot: JsonObject;
    name: string;
    ownerName: string;
    path: string;
    diagnostics: SlotShapeDiagnostic[];
}

function isUnknownRole(role: unknown): boolean {
    return role !== undefined && (typeof role !== 'string' || !roles.has(role.toLowerCase()));
}

function isRoutedByWithoutRouting(slot: JsonObject): boolean {
    const routedBy = Array.isArray(slot.routedBy) ? slot.routedBy : [];
    return routedBy.length > 0 && slot.routed !== true;
}

function checkSlotRole(context: SlotContext): void {
    const { slot, name, ownerName, path } = context;
    if (!isUnknownRole(slot.role)) return;
    context.diagnostics.push({
        code: SlotShapeDiagnosticCode.UnknownSlotRole,
        path: `${path}.role`,
        message: `The slot '${name}' of '${ownerName}' has the role '${String(slot.role)}'; a slot is a page, a pane or a panel`,
    });
}

function checkSlotRouting(context: SlotContext): void {
    const { slot, name, ownerName, path } = context;
    if (!isRoutedByWithoutRouting(slot)) return;
    context.diagnostics.push({
        code: SlotShapeDiagnosticCode.RouteParametersWithoutRouting,
        path: `${path}.routedBy`,
        message: `The slot '${name}' of '${ownerName}' is routed by ${(slot.routedBy as unknown[]).map(String).join(', ')} but is not routed`,
    });
}

function checkSlots(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): void {
    if (!Array.isArray(owner.slots)) return;

    const ownerName = ownerNameOf(owner);
    const primaries: string[] = [];
    owner.slots.forEach((slot: unknown, index: number) => {
        if (!isObject(slot) || typeof slot.name !== 'string') return;
        const context: SlotContext = { slot, name: slot.name, ownerName, path: `${path}.slots[${index}]`, diagnostics };
        checkSlotRole(context);
        checkSlotRouting(context);
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
