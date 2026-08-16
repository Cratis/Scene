// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneElement } from '@cratis/scene.model';
import { recordArrayProperty, stringArrayProperty } from '../properties';
import { ColumnDefinition } from './ColumnDefinition';

/**
 * Works out a table's columns, preferring what the screen said most explicitly.
 *
 * There are three ways a screen can express columns, and this walks them in order of intent:
 *
 * 1. Nested `column` children. Screenplay's screen vocabulary produces these, so they come first.
 * 2. A `columns` property, for a screen that would rather configure the table than nest elements.
 * 3. Nothing at all - in which case the keys of the first row are used.
 *
 * The third step matters more than it looks: a table given rows and no column configuration is the most
 * common thing an author writes first, and inferring the columns means it renders their data instead of
 * an empty grid they have to debug.
 *
 * Note that the children are read from `element.slots` - the *model* - and not from the rendered React
 * nodes the adapter is handed. Those nodes are `PrimeColumn` adapters produced by Scene's renderer, one
 * level removed from the `Column` declarations they render, so no amount of inspecting them recovers the
 * declaration. Reading the model instead is what makes nested `column` children work at all, and it is
 * why this derivation survived PrimeReact 11 removing `primereact/column` unchanged: it never depended
 * on the component in the first place.
 *
 * @param element The table element.
 * @param rows The rows the table will show, used for the inference step.
 * @returns The column definitions, in order.
 */
export function columnDefinitions(element: ExternalComponent, rows: Record<string, unknown>[]): ColumnDefinition[] {
    const children = [...(element.slots.columns ?? []), ...(element.slots.content ?? [])];
    const fromChildren = children.map(toColumnDefinition).filter((column): column is ColumnDefinition => column !== undefined);
    if (fromChildren.length > 0) return fromChildren;

    const fromProperty = recordArrayProperty(element, 'columns')
        .map((column) => toColumnDefinition({ id: '', properties: column }))
        .filter((column): column is ColumnDefinition => column !== undefined);
    if (fromProperty.length > 0) return fromProperty;

    const fromNames = stringArrayProperty(element, 'columns').map((field) => ({ field, header: field, sortable: false }));
    if (fromNames.length > 0) return fromNames;

    return Object.keys(rows[0] ?? {}).map((field) => ({ field, header: field, sortable: false }));
}

function toColumnDefinition(element: SceneElement): ColumnDefinition | undefined {
    const field = element.properties.field;
    const header = element.properties.header ?? element.properties.label;
    if (typeof field !== 'string') return undefined;
    return {
        field,
        header: typeof header === 'string' ? header : field,
        sortable: element.properties.sortable === true,
    };
}
