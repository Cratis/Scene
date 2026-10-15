// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The record page: a header, the key facts, then tabs (overview, related, files, history) with the record's main content, its related records and its
 * activity, and an aside. The tabs are configurable by changing one property.
 */
export const recordPageTemplate: ScreenTemplate = {
    name: 'RecordPage',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'summary' }, { name: 'tabs' }, { name: 'main' }, { name: 'related' }, { name: 'activity' }, { name: 'aside' }],
    arrangement: {
        root: column([slotLeaf('header'), slotLeaf('summary'), grid([column([slotLeaf('tabs'), slotLeaf('main'), slotLeaf('related'), slotLeaf('activity')], 16, { span: 2 }), slotLeaf('aside')], 3, 16)], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('summary'), slotLeaf('tabs'), slotLeaf('main'), slotLeaf('related'), slotLeaf('activity'), slotLeaf('aside')], 16) }],
    },
    content: {
        header: [component('record-header', 'pageHeader', { title: fromQuery('RecordValues', '0.name'), subtitle: 'Account' })],
        summary: [
            component('record-value', 'statCard', { label: 'Lifetime value', value: fromQuery('Kpis', '0.value'), format: 'currency', currency: 'USD' }),
            component('record-status', 'statusChip', { status: fromQuery('Deals', '0.status'), tone: 'info' }),
            component('record-people', 'avatarStack', { people: fromQuery('People') }),
        ],
        tabs: [component('record-tabs', 'tabSet', { tabs: fromQuery('RecordTabs'), urlKey: 'tab', label: 'Record sections' })],
        main: [component('record-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery('RecordSections'), values: fromQuery('RecordValues', '0') })],
        related: [component('record-related', 'dataList', { label: 'Related deals', rows: fromQuery('Deals'), columns: fromQuery('DealColumns'), titleField: 'name', pageSize: 5 })],
        activity: [component('record-activity', 'activityFeed', { label: 'History', entries: fromQuery('Activity') })],
        aside: [component('record-checklist', 'checklistSection', { sections: fromQuery('Checklist') })],
    },
    displayName: 'Record page',
    description: 'One record: its key facts, tabbed sections, related records and history.',
    metadata: { ...foundationTemplateProvenance, type: 'Detail', category: 'Foundation / Detail', thumbnail: thumbnailOf('RecordPage') },
};
