// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, OutletItemKind, OutletKind, OutletMode } from '@cratis/scene.model';
import { inventoryScreenDefinitions } from './inventoryScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const inventoryModule = 'inventory';

/**
 * The application structure the screen set implies: one module, `inventory`, a feature for each screen and the sub-features beneath it (`inventory.items.record` is the
 * `record` feature of `items`). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const inventoryStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: inventoryModule, name: 'Inventory', features: [], slices: [] };
    for (const screen of inventoryScreenDefinitions) {
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
 * the five places a warehouse goes: Dashboard, Items (with the table and the gallery beneath it), Locations, Movements and Suppliers.
 */
export const inventoryNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Inventory' },
        outlets: [{ name: NavigationRegionKind.Topbar, kind: OutletKind.Navigation, defaults: [{ kind: OutletItemKind.Navigation, id: 'inventory', title: 'Inventory', target: { module: inventoryModule } }] }],
    },
    modules: [{
        module: inventoryModule,
        refinements: [{
            outlet: NavigationRegionKind.Sidebar,
            mode: OutletMode.Overrides,
            items: [
                { kind: OutletItemKind.Navigation, id: 'dashboard', title: 'Dashboard', target: { module: inventoryModule, feature: 'dashboard' } },
                {
                    kind: OutletItemKind.Navigation, id: 'items', title: 'Items', target: { module: inventoryModule, feature: 'items' }, children: [
                        { kind: OutletItemKind.Navigation, id: 'item-table', title: 'Table', target: { module: inventoryModule, feature: 'items' } },
                        { kind: OutletItemKind.Navigation, id: 'item-gallery', title: 'Gallery', target: { module: inventoryModule, feature: 'items.gallery' } },
                    ],
                },
                { kind: OutletItemKind.Navigation, id: 'locations', title: 'Locations', target: { module: inventoryModule, feature: 'locations' } },
                { kind: OutletItemKind.Navigation, id: 'movements', title: 'Movements', target: { module: inventoryModule, feature: 'movements' } },
                { kind: OutletItemKind.Navigation, id: 'suppliers', title: 'Suppliers', target: { module: inventoryModule, feature: 'suppliers' } },
            ],
        }],
    }],
};
