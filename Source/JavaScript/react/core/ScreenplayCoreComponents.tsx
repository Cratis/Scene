// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveArgumentSource } from '@cratis/scene.engine';
import type { ExternalComponent } from '@cratis/scene.model';
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

/** The rows a host supplied for a read model: the query results keyed by the type name a table or summary shows. */
function rowsOf(queryResults: Record<string, unknown> | undefined, typeName: string): Record<string, unknown>[] {
    const rows = typeName ? queryResults?.[typeName] : undefined;
    return Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => row !== null && typeof row === 'object') : [];
}

function childrenOf(element: ExternalComponent, slot: string): ExternalComponent[] {
    return (element.slots?.[slot] ?? []) as ExternalComponent[];
}

function cell(value: unknown): string {
    if (value === null || value === undefined) return '';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/**
 * Renders a Screenplay table: the column headings, and a row for each of the rows the host supplied for the read model the table shows (`typeName`) - a
 * preview supplies the sample data, a running host its query results. With none supplied only the headings are drawn.
 */
export function CoreTable({ element, slots }: RegisteredComponentProps) {
    const scope = useRenderBindingScope();
    const columns = childrenOf(element, 'columns');
    const rows = rowsOf(scope.queryResults, textProperty(element.properties, 'typeName'));
    const grid = { display: 'grid', gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`, gap: '0.25rem 1rem' };
    return (
        <section data-scene-id={element.id} role='table' style={grid}>
            <header role='row' style={{ display: 'contents', fontWeight: 600 }}>{slots.columns}</header>
            {rows.map((row, index) => (
                <div key={index} role='row' style={{ display: 'contents' }}>
                    {columns.map(column => <span key={column.id} role='cell'>{cell(row[textProperty(column.properties, 'property')])}</span>)}
                </div>
            ))}
        </section>
    );
}

/** Renders a Screenplay table-column heading. */
export function CoreColumn({ element }: RegisteredComponentProps) {
    const property = textProperty(element.properties, 'property');
    return <span data-scene-id={element.id} role='columnheader'>{textProperty(element.properties, 'label', property)}</span>;
}

/** Renders a Screenplay summary: each field's label and, when the host supplied a row for the read model (`typeName`), its value in the first row. */
export function CoreSummary({ element }: RegisteredComponentProps) {
    const scope = useRenderBindingScope();
    const first = rowsOf(scope.queryResults, textProperty(element.properties, 'typeName'))[0];
    return (
        <dl data-scene-id={element.id}>
            {childrenOf(element, 'fields').map(field => {
                const property = textProperty(field.properties, 'property');
                return (
                    <div key={field.id}>
                        <dt data-scene-id={field.id}>{textProperty(field.properties, 'label', property)}</dt>
                        {first && <dd>{cell(first[property])}</dd>}
                    </div>
                );
            })}
        </dl>
    );
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
