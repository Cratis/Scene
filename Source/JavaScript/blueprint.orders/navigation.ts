// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { ordersScreenDefinitions } from './ordersScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const ordersModule = 'orders';

/**
 * The application structure the screen set implies: one module, `orders`, a feature for each screen and the sub-features beneath it (`orders.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const ordersStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: ordersModule, name: 'Orders', features: [], slices: [] };
    for (const screen of ordersScreenDefinitions) {
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
 * the places a team goes: Orders, Fulfilment and Deliveries.
 */
export const ordersNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Orders' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'orders', title: 'Orders', target: { module: ordersModule } }] }],
    },
    modules: [{
        module: ordersModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'order-list', title: 'Orders', target: { module: ordersModule, feature: 'list' } },
                { id: 'fulfilment', title: 'Fulfilment', target: { module: ordersModule, feature: 'fulfilment' } },
                { id: 'deliveries', title: 'Deliveries', target: { module: ordersModule, feature: 'deliveries' } },
            ],
        }],
    }],
};
