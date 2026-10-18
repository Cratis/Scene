// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { contractsScreenDefinitions } from './contractsScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const contractsModule = 'contracts';

/**
 * The application structure the screen set implies: one module, `contracts`, a feature for each screen and the sub-features beneath it (`contracts.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const contractsStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: contractsModule, name: 'Contracts', features: [], slices: [] };
    for (const screen of contractsScreenDefinitions) {
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
 * the places a team goes: Contracts, Timeline, Needs attention.
 */
export const contractsNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Contracts' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'contracts', title: 'Contracts', target: { module: contractsModule } }] }],
    },
    modules: [{
        module: contractsModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'list', title: 'Contracts', target: { module: contractsModule, feature: 'list' } },
                { id: 'timeline', title: 'Timeline', target: { module: contractsModule, feature: 'timeline' } },
                { id: 'review', title: 'Needs attention', target: { module: contractsModule, feature: 'review' } },
            ],
        }],
    }],
};
