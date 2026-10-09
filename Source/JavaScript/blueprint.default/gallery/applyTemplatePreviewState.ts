// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, Panel, SceneElement } from '@cratis/scene.model';
import { TemplatePreviewState } from './TemplatePreviewState';

/** What a table in a preview says when its data could not be loaded. */
export const previewErrorMessage = 'The data could not be loaded. Try again in a moment.';

/**
 * Puts every data-bearing element of a composed screen into one data state, leaving everything else - the
 * shell, headers, actions and static content - exactly as authored.
 *
 * A data-bearing element is one whose `rows` are records: the seeded rows are what a query would return,
 * so the states are expressed as a query's outcomes in the table's own vocabulary - no rows, `loading`, or
 * an `error` message - rather than by swapping in a different component. The authored tree is not changed.
 */
export function applyTemplatePreviewState<T extends SceneElement>(element: T, state: TemplatePreviewState): T {
    if (state === TemplatePreviewState.Populated) return element;
    return transform(element, state) as T;
}

/** Whether a composed screen contains anything a data state changes. */
export function hasPreviewData(element: SceneElement): boolean {
    const properties = (element as Partial<ExternalComponent>).properties;
    if (isDataBearing(properties)) return true;
    return childrenOf(element).some(hasPreviewData);
}

function transform(element: SceneElement, state: TemplatePreviewState): SceneElement {
    const external = element as Partial<ExternalComponent>;
    const panel = element as Partial<Panel>;
    let result: SceneElement = element;

    if (isDataBearing(external.properties)) {
        result = { ...result, properties: { ...external.properties, ...stateProperties(state) } } as SceneElement;
    }

    if (external.slots) {
        const slots = Object.fromEntries(Object.entries(external.slots).map(([name, children]) => [name, children.map(child => transform(child, state))]));
        result = { ...result, slots } as SceneElement;
    }

    if (Array.isArray(panel.children)) {
        result = { ...result, children: panel.children.map(child => transform(child, state)) } as SceneElement;
    }

    return result;
}

function stateProperties(state: TemplatePreviewState): Record<string, unknown> {
    switch (state) {
        case TemplatePreviewState.Empty: return { rows: [] };
        case TemplatePreviewState.Loading: return { rows: [], loading: true };
        case TemplatePreviewState.Error: return { rows: [], error: previewErrorMessage };
        default: return {};
    }
}

function isDataBearing(properties: Record<string, unknown> | undefined): boolean {
    const rows = properties?.rows;
    return Array.isArray(rows) && rows.every(row => typeof row === 'object' && row !== null && !Array.isArray(row));
}

function childrenOf(element: SceneElement): SceneElement[] {
    const external = element as Partial<ExternalComponent>;
    const panel = element as Partial<Panel>;
    return [...Object.values(external.slots ?? {}).flat(), ...(Array.isArray(panel.children) ? panel.children : [])];
}
