// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, TemplateScope } from '@cratis/scene.model';
import { quickCreateDialogTemplate, sideSheetTemplate } from '@cratis/scene.blueprint.default';
import { ProjectTrackerQuery, fromQuery, localeOfData } from '../projectTrackerQueries';
import { actionButton, closesDialog, component, goesTo, panel, projectTrackerMetadata, withBehaviors } from '../projectTrackerParts';

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a page to make one record without leaving it - with the fields
 * that thing needs to get started.
 */
function quickCreateOf(name: string, title: string, sections: string, noun: string): DialogTemplate {
    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title, subtitle: 'Only what is needed to get started' })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: 'Create' }, sections: fromQuery(sections), errors: fromQuery(ProjectTrackerQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `Project quick create ${noun}`,
        description: `A short form that creates one ${noun} without leaving the page.`,
        metadata: projectTrackerMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/**
 * The task: a `SideSheet` from the inline end that hosts a record page for one task - its status and people as key facts, its fields, its subtasks as a
 * checklist and the conversation about it - so a task is read from beside the board, the project's list or the user's own list it came from.
 */
export const projectTaskSheetTemplate: DialogTemplate = {
    name: 'ProjectTaskSheet',
    slots: sideSheetTemplate.slots,
    content: {
        header: [component('ProjectTaskSheet-frame', 'dialogFrame', { title: fromQuery(ProjectTrackerQuery.TaskRecord, '0.title'), subtitle: 'Task', placement: 'side', ...localeOfData })],
        body: [
            component('ProjectTaskSheet-status', 'statusChip', { status: fromQuery(ProjectTrackerQuery.TaskRecord, '0.status'), tone: fromQuery(ProjectTrackerQuery.TaskRecord, '0.tone') }),
            component('ProjectTaskSheet-people', 'avatarStack', { people: fromQuery(ProjectTrackerQuery.TaskRecord, '0.people') }),
            component('ProjectTaskSheet-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(ProjectTrackerQuery.TaskSections), values: fromQuery(ProjectTrackerQuery.TaskRecord, '0'), ...localeOfData }),
            component('ProjectTaskSheet-subtasks', 'checklistSection', { label: 'Subtasks', sections: fromQuery(ProjectTrackerQuery.TaskSubtasks), editPermission: 'enabled', ...localeOfData }),
            component('ProjectTaskSheet-activity', 'activityFeed', { label: 'Conversation', entries: fromQuery(ProjectTrackerQuery.TaskActivity), ...localeOfData }),
        ],
        actions: [panel('ProjectTaskSheet-actions', [
            withBehaviors(actionButton('ProjectTaskSheet-close', 'Close', 'secondary'), closesDialog()),
            withBehaviors(actionButton('ProjectTaskSheet-open', 'Open project', 'primary'), goesTo('projects.record')),
        ])],
    },
    displayName: 'Project task sheet',
    description: 'A side sheet that shows one task: its status, people, fields, subtasks and conversation.',
    metadata: projectTrackerMetadata('ProjectTaskSheet', 'Dialog', [TemplateScope.Slice]),
};

/** The quick creation of a project and of a task, and the side sheet of a task. */
export const projectTrackerDialogs: DialogTemplate[] = [
    quickCreateOf('ProjectQuickCreateProject', 'New project', 'ProjectQuickSections', 'project'),
    quickCreateOf('ProjectQuickCreateTask', 'New task', 'MyTaskQuickSections', 'task'),
    projectTaskSheetTemplate,
];
