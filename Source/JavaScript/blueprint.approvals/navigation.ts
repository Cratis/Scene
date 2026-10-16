// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { approvalsScreenDefinitions } from './approvalsScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const approvalsModule = 'approvals';

/**
 * The application structure the screen set implies: one module, `approvals`, a feature for each screen and the sub-features beneath it (`approvals.requests.new`
 * is the `new` feature of `requests`). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const approvalsStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: approvalsModule, name: 'Approvals', features: [], slices: [] };
    for (const screen of approvalsScreenDefinitions) {
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
 * The navigation of the application the blueprint is: the topbar names the module, and the module's sidebar - which overrides the application's - lists the four
 * places of an approvals application: Inbox, My requests, All requests and Templates (for administrators).
 */
export const approvalsNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Approvals' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'approvals', title: 'Approvals', target: { module: approvalsModule } }] }],
    },
    modules: [{
        module: approvalsModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'inbox', title: 'Inbox', target: { module: approvalsModule, feature: 'inbox' } },
                { id: 'requests', title: 'My requests', target: { module: approvalsModule, feature: 'requests' } },
                { id: 'all', title: 'All requests', target: { module: approvalsModule, feature: 'all' } },
                { id: 'templates', title: 'Templates', target: { module: approvalsModule, feature: 'templates' } },
            ],
        }],
    }],
};
