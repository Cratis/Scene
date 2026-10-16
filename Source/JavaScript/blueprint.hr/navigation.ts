// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { hrScreenDefinitions } from './hrScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const hrModule = 'hr';

/**
 * The application structure the screen set implies: one module, `hr`, a feature for each screen and the sub-features beneath it (`hr.directory.record` is the
 * `record` feature of `directory`). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const hrStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: hrModule, name: 'HR', features: [], slices: [] };
    for (const screen of hrScreenDefinitions) {
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
 * the four places an HR team goes: Directory, Org chart, Time off (with its requests and its balances beneath it) and Onboarding.
 */
export const hrNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'HR' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'hr', title: 'HR', target: { module: hrModule } }] }],
    },
    modules: [{
        module: hrModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'directory', title: 'Directory', target: { module: hrModule, feature: 'directory' } },
                { id: 'org', title: 'Org chart', target: { module: hrModule, feature: 'org' } },
                {
                    id: 'timeoff', title: 'Time off', target: { module: hrModule, feature: 'timeoff' }, children: [
                        { id: 'requests', title: 'Requests', target: { module: hrModule, feature: 'timeoff' } },
                        { id: 'balances', title: 'Balances', target: { module: hrModule, feature: 'timeoff.balances' } },
                    ],
                },
                { id: 'onboarding', title: 'Onboarding', target: { module: hrModule, feature: 'onboarding' } },
            ],
        }],
    }],
};
