// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { boardScreenTemplate } from '@cratis/scene.blueprint.default';
import { ProjectTrackerEntityKind, ProjectTrackerQuery, fromQuery, localeOfData, projectTrackerQueriesOf } from '../projectTrackerQueries';
import { actionButton, component, opensDialog, projectTrackerMetadata, withBehaviors } from '../projectTrackerParts';

/** A task board of the foundation `BoardScreen`: a column for each status and a card for each task, with or without a lane for each assignee. */
const boardOf = (name: string, swimlane: boolean): ScreenTemplate => ({
    name,
    fitsSlot: 'content',
    slots: boardScreenTemplate.slots,
    arrangement: boardScreenTemplate.arrangement,
    content: {
        header: [component(`${name}-header`, 'pageHeader', { title: swimlane ? 'Board by person' : 'Board', subtitle: swimlane ? 'A lane for each person; drag a task to a new status' : 'Drag a task to a new status' }, {
            actions: [withBehaviors(actionButton(`${name}-new`, 'New task', 'primary'), opensDialog('ProjectQuickCreateTask'))],
        })],
        toolbar: [
            component(`${name}-search`, 'globalSearch', { placeholder: 'Search the board', label: 'Search the board' }),
            component(`${name}-views`, 'savedViewsMenu', { views: fromQuery(projectTrackerQueriesOf(ProjectTrackerEntityKind.Task).views), savePermission: 'enabled', managePermission: 'enabled' }),
        ],
        board: [component(`${name}-columns`, 'kanbanBoard', {
            columns: fromQuery(ProjectTrackerQuery.BoardColumns), cards: fromQuery(ProjectTrackerQuery.BoardCards), editPermission: 'enabled', label: swimlane ? 'Tasks by person and status' : 'Tasks by status',
            ...(swimlane ? { swimlane: 'assignee' } : {}), ...localeOfData,
        })],
    },
    displayName: swimlane ? 'Project task board by person' : 'Project task board',
    description: swimlane ? 'Tasks in a lane for each assignee and a column for each status.' : 'Tasks as cards in a column for each status, moved by dragging or by menu.',
    metadata: projectTrackerMetadata(name, 'Board', [TemplateScope.Module, TemplateScope.Feature]),
});

/**
 * The task board: the foundation `BoardScreen` with a column for each status - to do, in progress, in review, done - and a card for each task with its title,
 * assignee, project, due date and priority. A task moves to another status by dragging or by its own Move-to menu, and the columns count what they hold and
 * say so in words when a limit is exceeded.
 */
export const projectTaskBoardTemplate: ScreenTemplate = boardOf('ProjectTaskBoard', false);

/** The task board with swimlanes by assignee: the same columns, a lane for each person (Part B 3.6, "swimlanes optional"). */
export const projectTaskLanesTemplate: ScreenTemplate = boardOf('ProjectTaskLanes', true);

