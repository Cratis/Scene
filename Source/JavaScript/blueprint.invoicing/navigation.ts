// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { invoicingScreenDefinitions } from './invoicingScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const invoicingModule = 'invoicing';

/**
 * The application structure the screen set implies: one module, `invoicing`, a feature for each screen and the sub-features beneath it (`invoicing.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const invoicingStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: invoicingModule, name: 'Invoicing', features: [], slices: [] };
    for (const screen of invoicingScreenDefinitions) {
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
 * the places a team goes: Overview, Invoices, Payments, Due dates.
 */
export const invoicingNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Invoicing' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'invoicing', title: 'Invoicing', target: { module: invoicingModule } }] }],
    },
    modules: [{
        module: invoicingModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'overview', title: 'Overview', target: { module: invoicingModule, feature: 'overview' } },
                { id: 'list', title: 'Invoices', target: { module: invoicingModule, feature: 'list' } },
                { id: 'payments', title: 'Payments', target: { module: invoicingModule, feature: 'payments' } },
                { id: 'due', title: 'Due dates', target: { module: invoicingModule, feature: 'due' } },
            ],
        }],
    }],
};
