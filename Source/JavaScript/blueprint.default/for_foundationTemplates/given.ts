// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SampleDataPack, SceneElement, ExternalComponent, BindingExpression, Panel } from '@cratis/scene.model';
import { foundationScreenTemplates } from '../foundation/templates';

/** The package root. */
export const packageRoot = join(import.meta.dirname, '..');

/** The sample-data pack the foundation templates are previewed with, read from where it ships. */
export const foundationPack: SampleDataPack = JSON.parse(readFileSync(join(packageRoot, 'sampleData', 'foundation-en.json'), 'utf-8'));

/** The names of the eight screen templates of Part B 2.2-2.9. */
export const foundationTemplateNames = foundationScreenTemplates.map(template => template.name);

/** Every element under a template's content, depth first, through slots and panel children. */
export function elementsOf(root: SceneElement[]): SceneElement[] {
    return root.flatMap(element => {
        const external = element as Partial<ExternalComponent>;
        const panel = element as Partial<Panel>;
        return [element, ...elementsOf([...Object.values(external.slots ?? {}).flat(), ...(Array.isArray(panel.children) ? panel.children : [])])];
    });
}

const isBinding = (value: unknown): value is BindingExpression => typeof value === 'object' && value !== null && 'path' in value && ('query' in value || 'componentId' in value);

/** Every property value of every element in a template, with the element and property it belongs to. */
export function propertiesOf(template: { content?: Record<string, SceneElement[]> }): { element: ExternalComponent; name: string; value: unknown }[] {
    return elementsOf(Object.values(template.content ?? {}).flat())
        .filter((element): element is ExternalComponent => 'componentName' in element)
        .flatMap(element => Object.entries(element.properties).map(([name, value]) => ({ element, name, value })));
}

/** The query names a template binds to. */
export const queriesOf = (template: { content?: Record<string, SceneElement[]> }): string[] =>
    [...new Set(propertiesOf(template).filter(entry => isBinding(entry.value)).map(entry => (entry.value as BindingExpression).query!))].sort();
