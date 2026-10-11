// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useContext } from 'react';
import { BindingScope, resolveBindingExpression } from '@cratis/scene.engine';
import { BindingExpression, BindingSourceKind, DestinationKind, DestinationReference } from '@cratis/scene.model';
import { RegisteredComponentProps, useRenderBindingScope } from '../renderer';
import { SceneNavigationContextInternal } from '../navigation/SceneNavigationContext';

/** How a toolbar item shows its icon and label - the `mode` an item's presentation hint can name. */
export type ToolbarItemMode = 'icon' | 'text' | 'both';

function textProperty(properties: Record<string, unknown>, name: string): string | undefined {
    return typeof properties[name] === 'string' ? properties[name] : undefined;
}

function recordProperty(properties: Record<string, unknown>, name: string): Record<string, unknown> {
    const value = properties[name];
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function isDestination(value: unknown): value is DestinationReference {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    return ['screen', 'module', 'route', 'dialog', 'outlet'].some(key => typeof (value as Record<string, unknown>)[key] === 'string');
}

function isBinding(value: unknown): value is BindingExpression {
    return value !== null && typeof value === 'object' && typeof (value as BindingExpression).path === 'string';
}

function literal(value: unknown): BindingExpression {
    return { kind: BindingSourceKind.Literal, path: '', value } as BindingExpression;
}

function resolveParameters(parameters: Record<string, unknown>, scope: BindingScope): Record<string, unknown> {
    return Object.fromEntries(Object.entries(parameters).map(([name, binding]) =>
        [name, isBinding(binding) ? resolveBindingExpression(binding, scope) : binding]));
}

/**
 * An authored destination with its route parameters read now, against the scope the item renders in.
 *
 * A navigation host resolves a destination against its own scope, which cannot see what the screen's components
 * publish - a table's selected row, an input's value - so the item resolves them where it is, and hands the host
 * literals. (The renderer leaves a destination's bindings alone, unlike the rest of an element's properties.)
 */
function withResolvedParameters(destination: DestinationReference, scope: BindingScope): DestinationReference {
    const bindings = destination.routeParameterBindings;
    if (!bindings) return destination;
    return {
        ...destination,
        routeParameterBindings: Object.fromEntries(Object.entries(bindings).map(([name, binding]) =>
            [name, literal(resolveBindingExpression(binding, scope))])),
    };
}

/** The mode the item's authored presentation asks for; anything it does not name shows both. */
export function toolbarItemMode(presentation: Record<string, unknown>): ToolbarItemMode {
    const mode = presentation.mode;
    return mode === 'icon' || mode === 'text' ? mode : 'both';
}

/**
 * Where activating a toolbar item goes.
 *
 * The destination the document authored wins. Without one, a `Navigate` item opens its target screen - its
 * parameters become route parameter bindings - and a `Dialog` item opens its target dialog template.
 */
export function toolbarItemDestination(properties: Record<string, unknown>): DestinationReference | undefined {
    if (isDestination(properties.destination)) return properties.destination;
    const kind = textProperty(properties, 'kind')?.toLowerCase();
    const target = textProperty(properties, 'target');
    if (!target) return undefined;
    // The renderer has already read each parameter's binding by the time the item sees it, so a parameter is a value.
    const routeParameterBindings = Object.fromEntries(Object.entries(recordProperty(properties, 'parameters'))
        .map(([name, value]) => [name, literal(value)])) as Record<string, BindingExpression>;
    if (kind === 'navigate') return { screen: target, routeParameterBindings };
    if (kind === 'dialog') return { kind: DestinationKind.Dialog, dialog: target, routeParameterBindings };
    return undefined;
}

/**
 * The `core:toolbar` component: the items a screen's toolbar groups, in the order they were authored.
 * The items are `core:toolbarItem` elements in its `items` slot.
 */
export function CoreToolbar({ element, slots }: RegisteredComponentProps) {
    const name = textProperty(element.properties, 'name');
    return <div data-scene-id={element.id} data-scene-toolbar={name} role='toolbar' aria-label={name}>{slots.items}</div>;
}

/**
 * The `core:toolbarItem` component: one toolbar entry with a label, an icon, presentation hints and what it does.
 *
 * - An `Action` item announces the command it targets with the host-neutral `cratis.scene.command` event, carrying its
 *   parameters resolved against the binding scope.
 * - A `Navigate` or `Dialog` item executes its destination through the enclosing navigation host - a screen in an
 *   outlet, a dialog - and, outside one, announces it with the host-neutral `cratis.scene.navigate` event.
 *
 * Presentation: `mode` is `icon`, `text` or `both` (the default); an icon-only item keeps its label as its accessible name.
 * Every presentation hint - `placement`, `density` or whatever a package reads - is also carried on the node as a
 * `data-scene-presentation-<name>` attribute so a theme can style by it.
 */
export function CoreToolbarItem({ element }: RegisteredComponentProps) {
    const navigation = useContext(SceneNavigationContextInternal);
    const scope = useRenderBindingScope();
    const name = textProperty(element.properties, 'name') ?? element.id;
    const kind = textProperty(element.properties, 'kind')?.toLowerCase();
    const target = textProperty(element.properties, 'target') ?? '';
    const label = textProperty(element.properties, 'label') ?? name;
    const icon = textProperty(element.properties, 'icon');
    const presentation = recordProperty(element.properties, 'presentation');
    const mode = toolbarItemMode(presentation);
    const destination = toolbarItemDestination(element.properties);
    const attributes = Object.fromEntries(Object.entries(presentation)
        .filter(([key]) => /^[A-Za-z][A-Za-z0-9-]*$/.test(key))
        .map(([key, value]) => [`data-scene-presentation-${key.toLowerCase()}`, String(value)]));

    const activate = () => {
        if (kind === 'action') {
            const args = resolveParameters(recordProperty(element.properties, 'parameters'), scope);
            globalThis.dispatchEvent(new CustomEvent('cratis.scene.command', { detail: { command: target, element, arguments: args } }));
            return;
        }

        if (!destination) return;
        const resolved = withResolvedParameters(destination, scope);
        if (navigation) {
            navigation.navigate(resolved);
        } else {
            globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', {
                detail: { targetScreen: destination.screen ?? '', dialog: destination.dialog, destination: resolved, element },
            }));
        }
    };

    return (
        <button
            type='button'
            data-scene-id={element.id}
            data-scene-toolbar-item={name}
            data-scene-icon={icon}
            data-scene-mode={mode}
            aria-label={mode === 'icon' ? label : undefined}
            title={mode === 'icon' ? label : undefined}
            disabled={kind !== 'action' && !destination}
            onClick={activate}
            {...attributes}
        >
            {mode !== 'text' && icon && <span aria-hidden='true' data-scene-icon-name={icon} />}
            {mode !== 'icon' && label}
        </button>
    );
}
