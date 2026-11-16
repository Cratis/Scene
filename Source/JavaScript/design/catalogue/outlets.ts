// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignCatalogue, DesignComponentEntry, DesignOutletRule, DesignTemplateEntry } from './DesignCatalogue';

const normalise = (name: string): string => name.toLowerCase().replace(/[\s._:-]/g, '');

/** Whether an outlet takes a component: one that may be placed, and is named by the outlet or in a category it takes - or any, for an open outlet. */
export const acceptsComponent = (outlet: DesignOutletRule, component: DesignComponentEntry): boolean =>
    component.placement === 'outlet' && (outlet.open || outlet.components.includes(component.name) || outlet.categories.includes(component.category));

/** The outlets of a template that take a component. */
export const homesOf = (outlets: readonly DesignOutletRule[], component: DesignComponentEntry): string[] =>
    outlets.filter(outlet => acceptsComponent(outlet, component)).map(outlet => outlet.name);

/** Finds a component by its id, else by its bare name when exactly one component has it. */
export function findComponent(catalogue: DesignCatalogue, name: string): DesignComponentEntry | undefined {
    const exact = catalogue.components.find(component => component.name === name);
    if (exact !== undefined) return exact;
    const matches = catalogue.components.filter(component => normalise(component.name.slice(component.name.lastIndexOf(':') + 1)) === normalise(name) || normalise(component.label) === normalise(name));
    return matches.length === 1 ? matches[0] : undefined;
}

export const findTemplate = (catalogue: DesignCatalogue, name: string): DesignTemplateEntry | undefined =>
    catalogue.templates.find(template => template.name === name);
