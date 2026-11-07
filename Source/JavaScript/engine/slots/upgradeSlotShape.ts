// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Toolbar } from '@cratis/scene.model';
import { toolbarAsOutletRefinement } from '../toolbar/toolbarOutlet';
import { SlotShapeDiagnostic, SlotShapeUpgrade } from './SlotShapeDiagnostic';
import { SlotShapeDiagnosticCode } from './SlotShapeDiagnosticCode';
import { isLegacyNavigationModel, upgradeNavigationContributions, upgradeNavigationModel } from './upgradeNavigationShape';
import { upgradeActionPresentation } from './upgradeActionPresentation';
import { upgradeToolbarElement } from './upgradeToolbarElement';

type JsonObject = { [key: string]: unknown };

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The order of a slot's keys, so an upgraded slot reads like one written in the new shape. */
const slotKeyOrder = ['name', 'arrangement', 'description', 'role', 'routed', 'routedBy', 'primary', 'optional', 'accepts'];

function ordered(slot: JsonObject): JsonObject {
    const result: JsonObject = {};
    for (const key of slotKeyOrder) if (slot[key] !== undefined) result[key] = slot[key];
    for (const key of Object.keys(slot)) if (!(key in result) && slot[key] !== undefined) result[key] = slot[key];
    return result;
}

const legacyOutletKeys = new Set(['name', 'description', 'accepts']);
const destinationKeys = ['screen', 'module', 'feature', 'slice', 'route', 'kind', 'dialog', 'routeParameterBindings'];

const destinationTargetKeys = ['screen', 'module', 'feature', 'slice', 'route', 'dialog', 'routeParameterBindings', 'outlet', 'slot'];

/**
 * Tells whether an object is a destination that opens the legacy `outlet` kind: the kind next to one of the keys that make
 * it a destination. Any other object with that kind is the user's and stays.
 * @param value The object.
 * @returns Whether it is a destination of the legacy kind.
 */
export function isDestinationOfLegacyKind(value: JsonObject): boolean {
    return isLegacyDestinationKind(value.kind) && destinationTargetKeys.some(key => key in value);
}

/**
 * Tells whether a key of an object holds the values a user typed: an element's `properties`. Inside them only destinations
 * and elements are upgraded and checked, so a value that looks like an old shape stays.
 * @param owner The object that has the key.
 * @param key The key.
 * @returns Whether the key holds user values.
 */
export function holdsUserValues(owner: JsonObject, key: string): boolean {
    return key === 'properties' && typeof owner.componentName === 'string';
}

/**
 * Whether a value is a list of outlets in the shape Scene 5 replaced with slots: a non-empty list of `{ name, description?,
 * accepts? }`. Anything else - such as an outlet of items, which has a kind - is not.
 * @param value The value of an `outlets` key.
 * @returns Whether it is a legacy outlet list.
 */
export function isLegacyOutletList(value: unknown): value is JsonObject[] {
    return Array.isArray(value)
        && value.length > 0
        && value.every(item => isObject(item) && typeof item.name === 'string' && Object.keys(item).every(key => legacyOutletKeys.has(key)));
}

/**
 * Whether an object is a destination that names an outlet the legacy way: an `outlet` text next to one of the other keys
 * of a destination.
 * @param value The object.
 * @returns Whether it is a legacy destination.
 */
export function isLegacyDestination(value: JsonObject): boolean {
    return typeof value.outlet === 'string' && destinationKeys.some(key => key in value);
}

/**
 * Whether a destination kind is the legacy `outlet`, in any letter case.
 * @param value The value of a `kind` key.
 * @returns Whether it is the legacy kind.
 */
export function isLegacyDestinationKind(value: unknown): boolean {
    return typeof value === 'string' && value.toLowerCase() === 'outlet';
}

/** The component a screen declared a nested outlet with, before Scene 5. */
export const legacyOutletComponentName = 'core:outlet';

/** The component a screen declares a nested routed slot with. */
export const slotComponentName = 'core:slot';

/** Renames `outlet` to `slot` keeping its letter case: `Outlet` becomes `Slot`, `OUTLET` becomes `SLOT`. */
function renamedKind(kind: string): string {
    if (kind === 'OUTLET') return 'SLOT';
    return kind.startsWith('O') ? 'Slot' : 'slot';
}

/**
 * Upgrades a stored Scene document - a whole document, a template library, or a single layout, screen template or
 * destination - from the outlet shape to the slot shape, in one pure step every host uses (Studio, Stage, the CLI and
 * the C# engine's `SlotShapeUpgrader`).
 *
 * - Every `outlets` entry of a layout or screen template becomes a slot with `routed: true`. When a slot of the same
 *   name already exists, it is marked routed and keeps its own values; the outlet's description and accepted types
 *   fill in only what it lacks.
 * - `metadata.primaryOutlet` becomes `primary: true` on the slot it names, and leaves the metadata.
 * - A destination's `outlet` becomes `slot`, and a destination kind of `outlet` becomes `slot`.
 * - A nested outlet a screen declares (`core:outlet`) becomes a nested slot (`core:slot`).
 * - A feature or module `toolbar` (`{ buttons }`), whose buttons every screen's toolbar got, becomes what it is now: a
 *   refinement that extends the `toolbar` outlet of actions, appended to the owner's `refinements`. A button's `target`
 *   (a command name) becomes the outlet button's `command`.
 * - A navigation model that lists regions stores outlets instead ({@link upgradeNavigationModel}): each application
 *   region becomes an outlet of navigation (its buttons the `<region>Buttons` outlet of actions), and each module
 *   region that extends or overrides becomes a refinement of it.
 * - Navigation items a screen contributes to a contribution point become contributions to the outlet of navigation of
 *   that name, in the screen's `outletContributions` ({@link upgradeNavigationContributions}).
 * - An `action` component's `presentation` becomes `opens` ({@link upgradeActionPresentation}): `none` runs directly,
 *   `modal` becomes `dialog` and `drawer` stays `drawer`. An action that stores no presentation keeps opening
 *   automatically.
 * - A screen's `core:toolbar` element, whose `items` slot held `core:toolbarItem` elements, becomes the `core:outletItems`
 *   element that draws an outlet of actions ({@link upgradeToolbarElement}).
 * - The function is idempotent: a document already in the slot shape comes back unchanged.
 * - It never overwrites or destroys a user's value: a slot that already has a description, `routed` or `accepts`
 *   keeps it (a `null` is never copied over it), `kind: outlet` is renamed only on a destination, and inside an
 *   element's `properties` - the values a user typed - only destinations are upgraded, so a value that happens to
 *   look like an old outlet list or toolbar stays as it is.
 * - What cannot be mapped is reported in `diagnostics` (never thrown) and stays as it was, so validation on save
 *   still refuses it.
 * @param document The stored document, parsed from JSON.
 * @returns The upgraded document, whether it changed, and what could not be mapped.
 */
export function upgradeSlotShape(document: unknown): SlotShapeUpgrade {
    const diagnostics: SlotShapeDiagnostic[] = [];
    const copy = structuredClone(document);
    const changed = upgrade(copy, '$', diagnostics);
    return { document: copy, changed, diagnostics };
}

function upgrade(value: unknown, path: string, diagnostics: SlotShapeDiagnostic[], inValues = false): boolean {
    if (Array.isArray(value)) {
        let changed = false;
        value.forEach((item, index) => {
            changed = upgrade(item, `${path}[${index}]`, diagnostics, inValues) || changed;
        });
        return changed;
    }

    if (!isObject(value)) return false;

    const element = typeof value.componentName === 'string';
    let changed = false;
    if (!inValues) {
        changed = mergeOutlets(value) || changed;
        changed = movePrimaryOutlet(value, path, diagnostics) || changed;
        changed = upgradeToolbar(value) || changed;
        if (isLegacyNavigationModel(value)) {
            upgradeNavigationModel(value);
            changed = true;
        }
        changed = upgradeNavigationContributions(value) || changed;
    }
    changed = renameDestination(value, path, diagnostics) || changed;
    if (element) {
        changed = upgradeActionPresentation(value, path, diagnostics) || changed;
        changed = upgradeToolbarElement(value, path, diagnostics) || changed;
        if (value.componentName === legacyOutletComponentName) {
            value.componentName = slotComponentName;
            changed = true;
        }
    }

    for (const [key, child] of Object.entries(value)) {
        changed = upgrade(child, `${path}.${key}`, diagnostics, inValues || holdsUserValues(value, key)) || changed;
    }

    return changed;
}

/**
 * Tells whether a value is the toolbar of a feature or module in the shape Scene 5 replaced with the `toolbar` outlet:
 * an object with nothing but a list of buttons, each with an id and a title.
 * @param value The value of an owner's `toolbar` key.
 * @returns Whether it is a legacy toolbar.
 */
export function isLegacyToolbar(value: unknown): value is Toolbar {
    return isObject(value)
        && Object.keys(value).length === 1
        && Array.isArray(value.buttons)
        && value.buttons.every(button => isObject(button) && typeof button.id === 'string' && typeof button.title === 'string');
}

function upgradeToolbar(owner: JsonObject): boolean {
    if (!isLegacyToolbar(owner.toolbar)) return false;
    const refinement = toolbarAsOutletRefinement(owner.toolbar);
    delete owner.toolbar;
    owner.refinements = [...(Array.isArray(owner.refinements) ? owner.refinements : []), refinement];
    return true;
}

function mergeOutlets(owner: JsonObject): boolean {
    if (!isLegacyOutletList(owner.outlets)) return false;

    const slots: JsonObject[] = Array.isArray(owner.slots) ? (owner.slots as unknown[]).filter(isObject) : [];
    for (const outlet of owner.outlets) {
        const index = slots.findIndex(slot => slot.name === outlet.name);
        const slot: JsonObject = index < 0 ? { name: outlet.name } : { ...slots[index] };
        copyIfAbsent(outlet, slot, 'description');
        if (slot.routed === undefined || slot.routed === null) slot.routed = true;
        copyIfAbsent(outlet, slot, 'accepts');
        if (index < 0) slots.push(ordered(slot));
        else slots[index] = ordered(slot);
    }

    const nonObjects = Array.isArray(owner.slots) ? (owner.slots as unknown[]).filter(slot => !isObject(slot)) : [];
    owner.slots = [...slots, ...nonObjects];
    delete owner.outlets;
    return true;
}

/**
 * Copies a value the upgraded object does not have - missing or `null`, both mean absent - and never copies a `null`, as
 * C#'s `CopyIfAbsent` does. A value the object has is the user's and stays.
 */
function copyIfAbsent(from: JsonObject, to: JsonObject, key: string): void {
    if ((to[key] === undefined || to[key] === null) && from[key] !== undefined && from[key] !== null) to[key] = from[key];
}

function movePrimaryOutlet(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): boolean {
    const metadata = owner.metadata;
    if (!isObject(metadata) || typeof metadata.primaryOutlet !== 'string') return false;

    const name = metadata.primaryOutlet;
    const slots = Array.isArray(owner.slots) ? (owner.slots as unknown[]).filter(isObject) : [];
    const target = slots.find(slot => slot.name === name);
    if (target === undefined) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.PrimarySlotNotDeclared,
            path: `${path}.metadata.primaryOutlet`,
            message: `The primary outlet '${name}' of '${String(owner.name)}' is not one of its slots, so no slot can be made primary`,
        });
        return false;
    }

    const other = slots.find(slot => slot.primary === true && slot !== target);
    if (other !== undefined) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.MultiplePrimarySlots,
            path: `${path}.metadata.primaryOutlet`,
            message: `The primary outlet '${name}' of '${String(owner.name)}' conflicts with its primary slot '${String(other.name)}'`,
        });
        return false;
    }

    target.primary = true;
    const replaced = ordered(target);
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, replaced);
    delete metadata.primaryOutlet;
    if (Object.keys(metadata).length === 0) delete owner.metadata;
    return true;
}

function renameDestination(destination: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): boolean {
    let changed = false;
    if (isDestinationOfLegacyKind(destination)) {
        destination.kind = renamedKind(destination.kind as string);
        changed = true;
    }

    if (!isLegacyDestination(destination)) return changed;

    if (destination.slot !== undefined && destination.slot !== destination.outlet) {
        diagnostics.push({
            code: SlotShapeDiagnosticCode.ConflictingSlotKey,
            path: `${path}.outlet`,
            message: `The destination names the outlet '${String(destination.outlet)}' and the slot '${String(destination.slot)}'; keep one`,
        });
        return changed;
    }

    const entries: [string, unknown][] = Object.entries(destination).map(([key, value]) => [key === 'outlet' ? 'slot' : key, value]);
    const seen = new Set<string>();
    for (const key of Object.keys(destination)) delete destination[key];
    for (const [key, value] of entries) {
        if (seen.has(key)) continue;
        seen.add(key);
        destination[key] = value;
    }

    return true;
}
