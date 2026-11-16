// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignCatalogue } from './DesignCatalogue';
import { findComponent, findTemplate } from './outlets';

/**
 * A question the catalogue answers: a list of one kind of thing, or the description of one. The AI read tools call these, so a
 * model reads what it needs on demand instead of being handed the whole catalogue.
 */
export type DesignCatalogueQuery =
    | { what: 'components'; category?: string; fitsTemplate?: string; fitsOutlet?: string; search?: string }
    | { what: 'component'; name: string }
    | { what: 'templates' }
    | { what: 'template'; name: string }
    | { what: 'tokens'; category?: string }
    | { what: 'token'; address: string }
    | { what: 'designComponents' }
    | { what: 'designComponent'; name: string }
    | { what: 'themes' }
    | { what: 'profile' }
    | { what: 'words' }
    | { what: 'shapes' }
    | { what: 'shape'; name: string }
    | { what: 'queries' }
    | { what: 'query'; name: string }
    | { what: 'commands' }
    | { what: 'command'; name: string };

/** What the catalogue answers: a list, a description, or that nothing of that name is there. */
export interface DesignCatalogueAnswer {
    found: boolean;
    items?: unknown[];
    item?: unknown;
}

const list = (items: unknown[]): DesignCatalogueAnswer => ({ found: true, items });
const one = (item: unknown): DesignCatalogueAnswer => item === undefined ? { found: false } : { found: true, item };

const matches = (value: string | undefined, search: string): boolean => (value ?? '').toLowerCase().includes(search.toLowerCase());

/** Answers a question from the catalogue; the answer never contains anything the catalogue does not list. */
export function queryDesignCatalogue(catalogue: DesignCatalogue, query: DesignCatalogueQuery): DesignCatalogueAnswer {
    switch (query.what) {
        case 'components': {
            const fits = query.fitsTemplate === undefined ? undefined : (name: string) => name.startsWith(`${query.fitsTemplate}.`) && (query.fitsOutlet === undefined || name === `${query.fitsTemplate}.${query.fitsOutlet}`);
            return list(catalogue.components
                .filter(component => query.category === undefined || component.category === query.category)
                .filter(component => fits === undefined || component.fits.some(fits))
                .filter(component => query.search === undefined || matches(component.name, query.search) || matches(component.label, query.search) || matches(component.description, query.search))
                .map(component => ({ name: component.name, label: component.label, category: component.category, placement: component.placement })));
        }
        case 'component': return one(findComponent(catalogue, query.name));
        case 'templates': return list(catalogue.templates.map(template => ({ name: template.name, displayName: template.displayName, type: template.type, outlets: template.outlets.map(outlet => outlet.name) })));
        case 'template': return one(findTemplate(catalogue, query.name));
        case 'tokens': return list(catalogue.tokens.filter(token => query.category === undefined || token.category === query.category).map(token => ({ address: token.address, description: token.description })));
        case 'token': return one(catalogue.tokens.find(token => token.address === query.address));
        case 'designComponents': return list(catalogue.designComponents.map(component => ({ name: component.name, variants: component.variants.map(variant => variant.name), boundTo: component.boundTo })));
        case 'designComponent': return one(catalogue.designComponents.find(component => component.name === query.name));
        case 'themes': return list(catalogue.themes);
        case 'profile': return one(catalogue.profile);
        case 'words': return one(catalogue.words);
        case 'shapes': return list(catalogue.shapes.map(shape => ({ name: shape.name, source: shape.source })));
        case 'shape': return one(catalogue.shapes.find(shape => shape.name === query.name));
        case 'queries': return list(catalogue.queries.map(entry => ({ id: entry.id, name: entry.name })));
        case 'query': return one(catalogue.queries.find(entry => entry.name === query.name || entry.id === query.name));
        case 'commands': return list(catalogue.commands.map(entry => ({ id: entry.id, name: entry.name })));
        case 'command': return one(catalogue.commands.find(entry => entry.name === query.name || entry.id === query.name));
    }
}
