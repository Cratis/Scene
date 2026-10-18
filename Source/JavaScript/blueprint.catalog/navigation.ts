// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { catalogScreenDefinitions } from './catalogScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const catalogModule = 'catalog';

/**
 * The application structure the screen set implies: one module, `catalog`, a feature for each screen and the sub-features beneath it (`catalog.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const catalogStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: catalogModule, name: 'Catalog', features: [], slices: [] };
    for (const screen of catalogScreenDefinitions) {
        let parent = root;
        for (const id of screen.name.split('.').slice(1)) {
            let node = parent.features.find(candidate => candidate.id === id);
            if (!node) {
                node = { id, name: screen.title, features: [], slices: [] };
                parent.features.push(node);
            }
            parent = node;
        }
    }

    return { modules: [{ id: root.id, name: root.name, features: root.features }] } as unknown as ApplicationStructure;
})();

/**
 * The navigation of the application the blueprint is: the topbar names the module, and the module's sidebar - which overrides the application's - lists
 * the places a team goes: Overview, Products, Categories.
 */
export const catalogNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Catalog' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'catalog', title: 'Catalog', target: { module: catalogModule } }] }],
    },
    modules: [{
        module: catalogModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'overview', title: 'Overview', target: { module: catalogModule, feature: 'overview' } },
                { id: 'products', title: 'Products', target: { module: catalogModule, feature: 'products' } },
                { id: 'categories', title: 'Categories', target: { module: catalogModule, feature: 'categories' } },
            ],
        }],
    }],
};
