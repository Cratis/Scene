// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The timeline screen (spec Part B 2.12): a Gantt-style schedule of work in lanes, over an axis of days, weeks or months, with progress, milestones and
 * dependencies, and a list of the same items beneath. On a phone the schedule is the table.
 */
export const timelineScreenTemplate: ScreenTemplate = {
    name: 'TimelineScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'toolbar' }, { name: 'timeline' }, { name: 'list' }],
    arrangement: {
        root: column([slotLeaf('header'), row([slotLeaf('toolbar')], 8), slotLeaf('timeline'), slotLeaf('list')], 12),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('toolbar'), slotLeaf('timeline'), slotLeaf('list')], 16) }],
    },
    content: {
        header: [component('timeline-header', 'pageHeader', { title: 'Timeline', subtitle: 'What is planned, by whom and when' })],
        toolbar: [component('timeline-search', 'globalSearch', { placeholder: 'Search the schedule', label: 'Search the schedule', urlKey: 'planq' })],
        timeline: [component('timeline-grid', 'timelineGrid', { label: 'Timeline', items: fromQuery('TimelineItems'), urlKey: 'scale' })],
        list: [component('timeline-list', 'dataList', { label: 'Schedule', rows: fromQuery('TimelineItems'), columns: fromQuery('TimelineItemColumns'), titleField: 'title', pageSize: 8 })],
    },
    displayName: 'Timeline',
    description: 'A Gantt-style schedule of work in lanes with progress, milestones and dependencies.',
    metadata: { ...foundationTemplateProvenance, type: 'Timeline', category: 'Foundation / Timeline', thumbnail: thumbnailOf('TimelineScreen') },
};
