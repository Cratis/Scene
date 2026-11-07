// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, OutletItemKind, OutletKind, OutletMode } from '@cratis/scene.model';
import { ticketingScreenDefinitions } from './ticketingScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const supportModule = 'support';

/**
 * The application structure the screen set implies: one module, `support`, a feature for each screen and the sub-features beneath it (`support.queue.board`
 * is the `board` feature of `queue`). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const ticketingStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: supportModule, name: 'Support', features: [], slices: [] };
    for (const screen of ticketingScreenDefinitions) {
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
 * The navigation of the application the blueprint is: the topbar names the module, and the module's sidebar - which overrides the application's - lists the five
 * places of a support team: Dashboard, Queue (with its list and its board beneath it), My tickets, Customers and Knowledge base.
 */
export const ticketingNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Support' },
        outlets: [{ name: NavigationRegionKind.Topbar, kind: OutletKind.Navigation, defaults: [{ kind: OutletItemKind.Navigation, id: 'support', title: 'Support', target: { module: supportModule } }] }],
    },
    modules: [{
        module: supportModule,
        refinements: [{
            outlet: NavigationRegionKind.Sidebar,
            mode: OutletMode.Overrides,
            items: [
                { kind: OutletItemKind.Navigation, id: 'dashboard', title: 'Dashboard', target: { module: supportModule, feature: 'dashboard' } },
                {
                    kind: OutletItemKind.Navigation, id: 'queue', title: 'Queue', target: { module: supportModule, feature: 'queue' }, children: [
                        { kind: OutletItemKind.Navigation, id: 'list', title: 'List', target: { module: supportModule, feature: 'queue' } },
                        { kind: OutletItemKind.Navigation, id: 'board', title: 'Board', target: { module: supportModule, feature: 'queue.board' } },
                    ],
                },
                { kind: OutletItemKind.Navigation, id: 'mine', title: 'My tickets', target: { module: supportModule, feature: 'mine' } },
                { kind: OutletItemKind.Navigation, id: 'customers', title: 'Customers', target: { module: supportModule, feature: 'customers' } },
                { kind: OutletItemKind.Navigation, id: 'knowledge', title: 'Knowledge base', target: { module: supportModule, feature: 'knowledge' } },
            ],
        }],
    }],
};
