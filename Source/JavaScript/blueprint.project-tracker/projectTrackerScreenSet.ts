// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`projects.list.record` would be the `record` feature of `list`). */
export interface ProjectTrackerScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const projectTrackerScreenDefinitions: ProjectTrackerScreenDefinition[] = [
    { name: 'projects.list', title: 'Projects', template: 'ProjectList', order: 0, description: 'Every project as a card with its owner, progress, due date and status.' },
    { name: 'projects.record', title: 'Project', template: 'ProjectPage', parent: 'projects.list', description: 'One project: key facts, its tasks and its members.' },
    { name: 'projects.mytasks', title: 'My tasks', template: 'ProjectMyTasks', order: 1, description: 'The tasks of the signed-in user, grouped by when they are due.' },
    { name: 'projects.board', title: 'Board', template: 'ProjectTaskBoard', order: 2, description: 'Tasks in a column for each status.' },
    { name: 'projects.board.lanes', title: 'Board by person', template: 'ProjectTaskLanes', parent: 'projects.board', order: 0, description: 'The same board with a lane for each assignee.' },
    { name: 'projects.timeline', title: 'Timeline', template: 'ProjectTimeline', order: 3, description: 'Every project as a bar on a schedule, in a lane for each owner, with progress, milestones and what waits on what.' },
];
