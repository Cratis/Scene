// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { workOrdersScreenDefinitions } from './workOrdersScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const workOrdersModule = 'workorders';

/**
 * The application structure the screen set implies: one module, `work orders`, a feature for each screen and the sub-features beneath it (`work orders.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const workOrdersStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: workOrdersModule, name: 'Work orders', features: [], slices: [] };
    for (const screen of workOrdersScreenDefinitions) {
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
 * the places a team goes: Work orders, Board, Schedule.
 */
export const workOrdersNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Work orders' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'workorders', title: 'Work orders', target: { module: workOrdersModule } }] }],
    },
    modules: [{
        module: workOrdersModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'list', title: 'Work orders', target: { module: workOrdersModule, feature: 'list' } },
                { id: 'board', title: 'Board', target: { module: workOrdersModule, feature: 'board' } },
                { id: 'schedule', title: 'Schedule', target: { module: workOrdersModule, feature: 'schedule' } },
            ],
        }],
    }],
};
