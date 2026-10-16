// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';
import { projectTrackerScreenDefinitions } from './projectTrackerScreenSet';

/** The module the blueprint's screens live in, and so the first segment of every screen's qualified name. */
export const projectTrackerModule = 'projects';

/**
 * The application structure the screen set implies: one module, `projects`, a feature for each screen and the sub-features beneath it (`projects.record` is the
 * `record` feature of the module). Derived from the screen names, so a screen added to the set is part of the structure without a second edit.
 */
export const projectTrackerStructure: ApplicationStructure = (() => {
    interface Node { id: string; name: string; features: Node[]; slices: never[] }
    const root: Node = { id: projectTrackerModule, name: 'Projects', features: [], slices: [] };
    for (const screen of projectTrackerScreenDefinitions) {
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
 * the places a team goes: Projects, My tasks, Board and Timeline.
 */
export const projectTrackerNavigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Projects' },
        regions: [{ region: NavigationRegionKind.Topbar, items: [{ id: 'projects', title: 'Projects', target: { module: projectTrackerModule } }] }],
    },
    modules: [{
        module: projectTrackerModule,
        regions: [{
            region: NavigationRegionKind.Sidebar,
            mode: NavigationRegionMode.Override,
            items: [
                { id: 'project-list', title: 'Projects', target: { module: projectTrackerModule, feature: 'list' } },
                { id: 'my-tasks', title: 'My tasks', target: { module: projectTrackerModule, feature: 'mytasks' } },
                {
                    id: 'board', title: 'Board', target: { module: projectTrackerModule, feature: 'board' }, children: [
                        { id: 'board-status', title: 'By status', target: { module: projectTrackerModule, feature: 'board' } },
                        { id: 'board-person', title: 'By person', target: { module: projectTrackerModule, feature: 'board.lanes' } },
                    ],
                },
                { id: 'timeline', title: 'Timeline', target: { module: projectTrackerModule, feature: 'timeline' } },
            ],
        }],
    }],
};
