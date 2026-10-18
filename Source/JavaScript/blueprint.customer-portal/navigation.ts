// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { customerPortalScreenDefinitions } from './customerPortalScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const customerPortalModule = 'portal';

/**
 * The application structure the screen set implies: one module, `customer portal`, a feature for each screen and the sub-features beneath it (`customer portal.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const customerPortalStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: customerPortalModule, name: 'Customer portal', features: [], slices: [] };
    for (const screen of customerPortalScreenDefinitions) {
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
 * the places a team goes: Home, Orders, Invoices, Support, Profile.
 */
export const customerPortalNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Customer portal' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'portal', title: 'Customer portal', target: { module: customerPortalModule } }] }],
    },
    modules: [{
        module: customerPortalModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'home', title: 'Home', target: { module: customerPortalModule, feature: 'home' } },
                { id: 'orders', title: 'Orders', target: { module: customerPortalModule, feature: 'orders' } },
                { id: 'invoices', title: 'Invoices', target: { module: customerPortalModule, feature: 'invoices' } },
                { id: 'support', title: 'Support', target: { module: customerPortalModule, feature: 'support' } },
                { id: 'profile', title: 'Profile', target: { module: customerPortalModule, feature: 'profile' } },
            ],
        }],
    }],
};
