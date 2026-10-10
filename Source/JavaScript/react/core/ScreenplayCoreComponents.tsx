// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveArgumentSource } from '@cratis/scene.engine';
import { RegisteredComponentProps, useRenderBindingScope } from '../renderer';

function textProperty(properties: Record<string, unknown>, name: string, fallback = ''): string {
    return typeof properties[name] === 'string' ? properties[name] : fallback;
}

/** Carries a Screenplay data declaration without adding visual chrome. */
export function CoreData({ element }: RegisteredComponentProps) {
    return <span hidden data-scene-id={element.id} data-scene-data={textProperty(element.properties, 'typeName')} />;
}

/** One entry of a command action's argument mapping. */
interface ArgumentMapping {
    name?: unknown;
    source?: unknown;
}

/**
 * Renders a modeled command action and emits a host-neutral command event when invoked.
 *
 * The event carries the resolved `arguments`, by name, read when the action is invoked: a
 * `component.<id>.<output>` source reads what another element publishes - such as what the user typed into
 * an input - and any other source is a data-context path. Hosts that read the mapping from `element`
 * themselves keep working.
 */
export function CoreAction({ element }: RegisteredComponentProps) {
    const command = textProperty(element.properties, 'command');
    const label = textProperty(element.properties, 'label', command);
    const scope = useRenderBindingScope();
    const invoke = () => {
        const mapping = Array.isArray(element.properties.arguments) ? element.properties.arguments as ArgumentMapping[] : [];
        const args = Object.fromEntries(mapping
            .filter((argument): argument is { name: string; source: string } => typeof argument.name === 'string' && typeof argument.source === 'string')
            .map(argument => [argument.name, resolveArgumentSource(argument.source, scope)]));
        globalThis.dispatchEvent(new CustomEvent('cratis.scene.command', { detail: { command, element, arguments: args } }));
    };
    return <button type='button' data-scene-id={element.id} onClick={invoke}>{label}</button>;
}

/** Groups the nested content of a Screenplay section. */
export function CoreSection({ element, slots }: RegisteredComponentProps) {
    const name = textProperty(element.properties, 'name');
    return <section data-scene-id={element.id}>{name && <h2>{name}</h2>}{slots.content}</section>;
}

/** Renders navigation intent and emits a host-neutral navigation event. */
export function CoreNavigate({ element }: RegisteredComponentProps) {
    const targetScreen = textProperty(element.properties, 'targetScreen');
    const navigate = () => globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', { detail: { targetScreen, element } }));
    return <button type='button' data-scene-id={element.id} onClick={navigate}>{targetScreen}</button>;
}

/** Renders a Screenplay title directive. */
export function CoreTitle({ element }: RegisteredComponentProps) {
    return <h1 data-scene-id={element.id}>{textProperty(element.properties, 'text')}</h1>;
}

/** Renders the structural shell of a Screenplay table. Query data is supplied by the host. */
export function CoreTable({ element, slots }: RegisteredComponentProps) {
    return <section data-scene-id={element.id} role='table'><header role='row'>{slots.columns}</header></section>;
}

/** Renders a Screenplay table-column heading. */
export function CoreColumn({ element }: RegisteredComponentProps) {
    const property = textProperty(element.properties, 'property');
    return <span data-scene-id={element.id} role='columnheader'>{textProperty(element.properties, 'label', property)}</span>;
}

/** Renders the structural shell of a Screenplay summary. Query data is supplied by the host. */
export function CoreSummary({ element, slots }: RegisteredComponentProps) {
    return <dl data-scene-id={element.id}>{slots.fields}</dl>;
}

/** Renders a Screenplay summary field label. */
export function CoreField({ element }: RegisteredComponentProps) {
    const property = textProperty(element.properties, 'property');
    return <dt data-scene-id={element.id}>{textProperty(element.properties, 'label', property)}</dt>;
}

/** Renders a Screenplay code block. */
export function CoreCode({ element }: RegisteredComponentProps) {
    const language = textProperty(element.properties, 'language');
    return <pre data-scene-id={element.id}><code data-language={language}>{textProperty(element.properties, 'code')}</code></pre>;
}

/** Makes an external screen-file reference visible until a host supplies that file. */
export function CoreFile({ element }: RegisteredComponentProps) {
    return <p data-scene-id={element.id}>Screen source: {textProperty(element.properties, 'path')}</p>;
}
