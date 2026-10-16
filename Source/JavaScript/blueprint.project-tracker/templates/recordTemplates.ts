// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { ProjectTrackerEntityKind, ProjectTrackerQuery, fromQuery, localeOfData, projectTrackerQueriesOf } from '../projectTrackerQueries';
import { actionButton, component, opensDialog, opensDialogOnSelect, projectTrackerMetadata, withBehaviors } from '../projectTrackerParts';

const project = projectTrackerQueriesOf(ProjectTrackerEntityKind.Project);

/**
 * The project page: the foundation `RecordPage` with the project's name as its title and New task as its action, its status, progress and open tasks as key
 * facts, the project's fields, its task list in the main region - choosing a task opens it in a side sheet, so the list stays where it was - and its members
 * and its activity beside it.
 */
export const projectPageTemplate: ScreenTemplate = {
    name: 'ProjectPage',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('ProjectPage-header', 'pageHeader', { title: fromQuery(project.record, '0.name'), subtitle: fromQuery(project.record, '0.summary') }, {
            actions: [withBehaviors(actionButton('ProjectPage-new', 'New task', 'primary'), opensDialog('ProjectQuickCreateTask'))],
        })],
        summary: [
            component('ProjectPage-status', 'statusChip', { status: fromQuery(project.summary, '0.status'), tone: fromQuery(project.summary, '0.tone') }),
            component('ProjectPage-progress', 'statCard', { label: 'Progress', value: fromQuery(project.summary, '0.progress'), format: 'percent', ...localeOfData }),
            component('ProjectPage-open', 'statCard', { label: 'Open tasks', value: fromQuery(project.summary, '0.open'), ...localeOfData }),
            component('ProjectPage-left', 'statCard', { label: 'Days left', value: fromQuery(project.summary, '0.daysLeft'), ...localeOfData }),
        ],
        tabs: [component('ProjectPage-tabs', 'tabSet', { tabs: fromQuery(ProjectTrackerQuery.RecordTabs), urlKey: 'tab', label: 'Project sections' })],
        main: [
            component('ProjectPage-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(project.sections), values: fromQuery(project.record, '0'), ...localeOfData }),
            withBehaviors(component('ProjectPage-tasks', 'dataList', {
                label: 'Tasks', rows: fromQuery(project.tasks), columns: fromQuery('ProjectTaskColumns'), titleField: 'title', pageSize: 8, selectionMode: 'single', urlKey: 'tasks', ...localeOfData,
            }), opensDialogOnSelect('ProjectTaskSheet')),
        ],
        related: [],
        activity: [component('ProjectPage-activity', 'activityFeed', { label: 'Activity', entries: fromQuery(project.activity), ...localeOfData })],
        aside: [component('ProjectPage-members', 'dataList', { label: 'Members', rows: fromQuery(project.members), columns: fromQuery('ProjectMemberColumns'), titleField: 'name', ...localeOfData })],
    },
    displayName: 'Project page',
    description: 'One project: key facts, its task list, its members and its activity.',
    metadata: projectTrackerMetadata('ProjectPage', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
