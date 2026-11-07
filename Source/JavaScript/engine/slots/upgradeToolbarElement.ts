// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SlotShapeDiagnostic } from './SlotShapeDiagnostic';
import { SlotShapeDiagnosticCode } from './SlotShapeDiagnosticCode';

type JsonObject = { [key: string]: unknown };

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: JsonObject, key: string): string | undefined {
    const entry = value[key];
    return typeof entry === 'string' && entry.length > 0 ? entry : undefined;
}

/** The component a screen's toolbar was before Scene 5 made it an outlet of actions. */
export const legacyToolbarComponentName = 'core:toolbar';

/** The component each item of a legacy toolbar was, in the toolbar's `items` slot. */
export const legacyToolbarItemComponentName = 'core:toolbarItem';

/** The component that draws the items of an outlet where a template or screen places it. */
export const outletItemsComponentName = 'core:outletItems';

/** The outlet a legacy toolbar that names none becomes. */
const defaultToolbarOutlet = 'toolbar';

/** What the validator tells a document that still has a legacy toolbar element. */
export const toolbarElementMigrationHint = 'Scene 5 replaced the core:toolbar component and its core:toolbarItem items with an outlet of actions drawn by core:outletItems: upgrade the document (upgradeSlotShape, or SlotShapeUpgrader in C#), or run `screenplay migrate --from 5 --to 6` on its Screenplay source';

const emphases = new Set(['primary', 'secondary', 'quiet']);
const destinationKeys = ['screen', 'module', 'route', 'dialog', 'slot'];

function isDestination(value: unknown): value is JsonObject {
    return isObject(value) && destinationKeys.some(key => typeof value[key] === 'string');
}

function isBinding(value: unknown): boolean {
    return isObject(value) && typeof value.path === 'string';
}

function routeParameterBindings(parameters: JsonObject): JsonObject {
    return Object.fromEntries(Object.entries(parameters).map(([name, value]) =>
        [name, isBinding(value) ? value : { kind: 'literal', path: '', value }]));
}

/**
 * Turns one item element of a legacy toolbar into a button of an outlet of actions, or says why it cannot.
 * @param element The `core:toolbarItem` element.
 * @returns The button, or the reason it cannot be carried over.
 */
function asButton(element: unknown): { button: JsonObject; dropped: string[] } | { reason: string } {
    if (!isObject(element) || element.componentName !== legacyToolbarItemComponentName || !isObject(element.properties)) {
        return { reason: `holds '${isObject(element) ? String(element.componentName) : String(element)}', which is not a ${legacyToolbarItemComponentName}` };
    }

    const properties = element.properties;
    const id = String(element.id);
    const presentation = isObject(properties.presentation) ? properties.presentation : {};
    const dropped = Object.entries(presentation).filter(([key, value]) => !(key === 'mode' && value === 'both')).map(([key]) => key);

    const kind = text(properties, 'kind')?.toLowerCase();
    const target = text(properties, 'target');
    const slice = text(properties, 'slice');
    const parameters = isObject(properties.parameters) ? properties.parameters : {};
    const hasParameters = Object.keys(parameters).length > 0;

    const button: JsonObject = { kind: 'button', id, title: text(properties, 'label') ?? text(properties, 'name') ?? id };
    const icon = text(properties, 'icon');
    if (icon !== undefined) button.icon = icon;
    if (slice !== undefined) {
        button.slice = slice;
    } else if (isDestination(properties.destination)) {
        button.navigateTo = properties.destination;
    } else if (kind === 'navigate' && target !== undefined) {
        button.navigateTo = hasParameters ? { screen: target, routeParameterBindings: routeParameterBindings(parameters) } : { screen: target };
    } else if (kind === 'dialog' && target !== undefined) {
        button.navigateTo = { kind: 'dialog', dialog: target, ...(hasParameters ? { routeParameterBindings: routeParameterBindings(parameters) } : {}) };
    } else if (target !== undefined) {
        button.command = target;
    }

    if (hasParameters && button.navigateTo === undefined) {
        return { reason: `has the item '${id}' that passes parameters to its command, which an outlet button takes from the slice's inputs instead` };
    }

    const emphasis = text(properties, 'emphasis')?.toLowerCase();
    if (emphasis !== undefined && emphases.has(emphasis)) button.emphasis = emphasis;
    const confirm = text(properties, 'confirm');
    if (confirm !== undefined) button.confirm = confirm;
    return { button, dropped };
}

/**
 * Tells whether an object is a legacy toolbar element or one of its items.
 * @param value The object.
 * @returns Whether its component is `core:toolbar` or `core:toolbarItem`.
 */
export function isLegacyToolbarElement(value: JsonObject): boolean {
    return value.componentName === legacyToolbarComponentName || value.componentName === legacyToolbarItemComponentName;
}

/**
 * Turns a `core:toolbar` element - whose `items` slot held `core:toolbarItem` elements - into the `core:outletItems`
 * element that draws an outlet of actions: the toolbar's `name` names the outlet (`toolbar` when it names none), and each
 * item a button - its slice, its navigation target or dialog as `navigateTo`, or its hand-typed command as `command`, with
 * its title, icon, emphasis and confirmation. Presentation hints other than showing icon and text are only cosmetic: they
 * are dropped and reported (`droppedPresentationHints`), and the item is upgraded. A toolbar holding something that cannot
 * become a button - another element, parameters passed to a command - is reported and left as it was.
 * @param owner The object, which is changed in place.
 * @param path The JSON path of the object.
 * @param diagnostics Where what cannot be mapped is reported.
 * @returns Whether the object changed.
 */
export function upgradeToolbarElement(owner: JsonObject, path: string, diagnostics: SlotShapeDiagnostic[]): boolean {
    if (owner.componentName !== legacyToolbarComponentName) return false;

    const properties = isObject(owner.properties) ? owner.properties : {};
    const slots = isObject(owner.slots) ? owner.slots : {};
    const elements = Array.isArray(slots.items) ? slots.items : [];
    const buttons: JsonObject[] = [];
    const dropped: SlotShapeDiagnostic[] = [];
    for (const [index, element] of elements.entries()) {
        const result = asButton(element);
        if ('reason' in result) {
            diagnostics.push({
                code: SlotShapeDiagnosticCode.LegacyToolbarElement,
                path: `${path}.slots.items`,
                message: `The toolbar '${String(owner.id)}' ${result.reason}, so it is kept as it is`,
            });
            return false;
        }
        buttons.push(result.button);
        if (result.dropped.length > 0) {
            dropped.push({
                code: SlotShapeDiagnosticCode.DroppedPresentationHints,
                path: `${path}.slots.items[${index}].properties.presentation`,
                message: `The toolbar '${String(owner.id)}' has the item '${String(result.button.id)}' with the presentation hints ${result.dropped.join(', ')}, which an outlet button has no place for, so they are dropped`,
            });
        }
    }
    diagnostics.push(...dropped);

    owner.componentName = outletItemsComponentName;
    owner.properties = { name: text(properties, 'name') ?? defaultToolbarOutlet, kind: 'actions', items: buttons };
    owner.slots = {};
    return true;
}
