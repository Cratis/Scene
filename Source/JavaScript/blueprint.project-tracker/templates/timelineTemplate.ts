// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { timelineScreenTemplate } from '@cratis/scene.blueprint.default';
import { ProjectTrackerQuery, fromQuery, localeOfData } from '../projectTrackerQueries';
import { actionButton, component, goesTo, projectTrackerMetadata, withBehaviors } from '../projectTrackerParts';

/**
 * The project timeline: the foundation `TimelineScreen` with every project as a bar in a lane for each owner, how far along it is, the milestones that mark a go-live,
 * what waits on what, and a conflict told in words when one owner's bars overlap. The scale (day, week or month) is kept in the address; on a phone the schedule is
 * the table, and the same items are listed beneath.
 */
export const projectTimelineTemplate: ScreenTemplate = {
    name: 'ProjectTimeline',
    fitsSlot: 'content',
    slots: timelineScreenTemplate.slots,
    arrangement: timelineScreenTemplate.arrangement,
    content: {
        header: [component('ProjectTimeline-header', 'pageHeader', { title: 'Timeline', subtitle: 'Every project on a schedule, by owner' }, {
            actions: [withBehaviors(actionButton('ProjectTimeline-projects', 'Open the projects', 'secondary'), goesTo('projects.list'))],
        })],
        toolbar: [component('ProjectTimeline-search', 'globalSearch', { placeholder: 'Search the timeline', label: 'Search the timeline', urlKey: 'timelineq' })],
        timeline: [component('ProjectTimeline-grid', 'timelineGrid', {
            label: 'Project timeline', items: fromQuery(ProjectTrackerQuery.TimelineItems), today: fromQuery(ProjectTrackerQuery.Settings, '0.today'),
            firstDay: fromQuery(ProjectTrackerQuery.Settings, '0.firstDay'), urlKey: 'scale', ...localeOfData,
        })],
        list: [component('ProjectTimeline-list', 'dataList', {
            label: 'Schedule', rows: fromQuery(ProjectTrackerQuery.TimelineItems), columns: fromQuery(ProjectTrackerQuery.TimelineColumns), titleField: 'title', pageSize: 8, ...localeOfData,
        })],
    },
    displayName: 'Project timeline',
    description: 'Every project as a bar on a schedule in a lane for each owner, with progress, milestones and dependencies.',
    metadata: projectTrackerMetadata('ProjectTimeline', 'Timeline', [TemplateScope.Module, TemplateScope.Feature]),
};
