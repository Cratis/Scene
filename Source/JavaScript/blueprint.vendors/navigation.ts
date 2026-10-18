// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { vendorsScreenDefinitions } from './vendorsScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const vendorsModule = 'vendors';

/**
 * The application structure the screen set implies: one module, `vendors`, a feature for each screen and the sub-features beneath it (`vendors.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const vendorsStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: vendorsModule, name: 'Vendors', features: [], slices: [] };
    for (const screen of vendorsScreenDefinitions) {
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
 * the places a team goes: Vendors, Onboarding, Performance.
 */
export const vendorsNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Vendors' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'vendors', title: 'Vendors', target: { module: vendorsModule } }] }],
    },
    modules: [{
        module: vendorsModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'list', title: 'Vendors', target: { module: vendorsModule, feature: 'list' } },
                { id: 'onboarding', title: 'Onboarding', target: { module: vendorsModule, feature: 'onboarding' } },
                { id: 'performance', title: 'Performance', target: { module: vendorsModule, feature: 'performance' } },
            ],
        }],
    }],
};
