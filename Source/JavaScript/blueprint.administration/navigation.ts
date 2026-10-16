// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { administrationScreenDefinitions } from './administrationScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const administrationModule = 'admin';

/**
 * The application structure the screen set implies: one module, `admin`, a feature for each screen and the sub-features beneath it (`admin.users.record` is the
 * `record` feature of `users`). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const administrationStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: administrationModule, name: 'Administration', features: [], slices: [] };
    for (const screen of administrationScreenDefinitions) {
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
 * the four places an administrator goes: Users, Roles, Settings and Audit log.
 */
export const administrationNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Administration' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'admin', title: 'Administration', target: { module: administrationModule } }] }],
    },
    modules: [{
        module: administrationModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'users', title: 'Users', target: { module: administrationModule, feature: 'users' } },
                { id: 'roles', title: 'Roles', target: { module: administrationModule, feature: 'roles' } },
                { id: 'settings', title: 'Settings', target: { module: administrationModule, feature: 'settings' } },
                { id: 'audit', title: 'Audit log', target: { module: administrationModule, feature: 'audit' } },
            ],
        }],
    }],
};
