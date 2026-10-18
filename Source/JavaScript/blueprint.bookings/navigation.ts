// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { bookingsScreenDefinitions } from './bookingsScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const bookingsModule = 'bookings';

/**
 * The application structure the screen set implies: one module, `bookings`, a feature for each screen and the sub-features beneath it (`bookings.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const bookingsStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: bookingsModule, name: 'Bookings', features: [], slices: [] };
    for (const screen of bookingsScreenDefinitions) {
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
 * the places a team goes: Calendar, Bookings, Resources, New booking.
 */
export const bookingsNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Bookings' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'bookings', title: 'Bookings', target: { module: bookingsModule } }] }],
    },
    modules: [{
        module: bookingsModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'calendar', title: 'Calendar', target: { module: bookingsModule, feature: 'calendar' } },
                { id: 'list', title: 'Bookings', target: { module: bookingsModule, feature: 'list' } },
                { id: 'resources', title: 'Resources', target: { module: bookingsModule, feature: 'resources' } },
                { id: 'new', title: 'New booking', target: { module: bookingsModule, feature: 'new' } },
            ],
        }],
    }],
};
