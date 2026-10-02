// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';

function isExternalComponentValue(value: object): value is ExternalComponent {
    const candidate = value as Partial<ExternalComponent>;
    return typeof candidate.id === 'string' && typeof candidate.componentName === 'string'
        && candidate.properties !== null && typeof candidate.properties === 'object';
}

/**
 * Finds every external component anywhere inside a layout, template, dialog template or screen, each once by id.
 *
 * It scans the value's structure rather than following a fixed list of properties, so a component is found
 * wherever the model keeps it - slot content, a flow leaf, a freeform placement, a panel's children, another
 * component's slot. A freeform arrangement repeats an element across its size-class variants; the first copy
 * is the one returned.
 */
export function collectComponents(owner: unknown): ExternalComponent[] {
    const found = new Map<string, ExternalComponent>();

    const visit = (value: unknown): void => {
        if (value === null || typeof value !== 'object') return;
        if (Array.isArray(value)) {
            for (const item of value) visit(item);
            return;
        }

        if (isExternalComponentValue(value) && !found.has(value.id)) found.set(value.id, value);
        for (const child of Object.values(value)) visit(child);
    };

    visit(owner);
    return [...found.values()];
}
