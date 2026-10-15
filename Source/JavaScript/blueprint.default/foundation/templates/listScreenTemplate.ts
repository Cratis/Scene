// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The collection screen: search, filters, a list that is a table, grouped, or cards, a bar that appears when rows are selected, and a footer for paging.
 * Search, sort, page and selection live in the address, so a link shares the list as it is. On a phone the table becomes cards.
 */
export const listScreenTemplate: ScreenTemplate = {
    name: 'ListScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'toolbar' }, { name: 'filters' }, { name: 'list' }, { name: 'bulkBar' }, { name: 'footer' }],
    arrangement: {
        root: column([slotLeaf('header'), row([slotLeaf('toolbar')], 8), slotLeaf('filters'), slotLeaf('bulkBar'), slotLeaf('list'), slotLeaf('footer')], 12),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('toolbar'), slotLeaf('filters'), slotLeaf('bulkBar'), slotLeaf('list'), slotLeaf('footer')], 16) }],
    },
    content: {
        header: [component('list-header', 'pageHeader', { title: 'Deals', subtitle: 'Every open and closed deal' })],
        toolbar: [
            component('list-search', 'globalSearch', { placeholder: 'Search deals', label: 'Search deals', urlKey: 'dealsq' }),
            component('list-views', 'savedViewsMenu', { views: fromQuery('DealViews'), savePermission: 'enabled', managePermission: 'enabled' }),
            component('list-columns', 'columnChooser', { columns: fromQuery('DealColumnChoices') }),
        ],
        filters: [component('list-filter', 'filterBuilder', { fields: fromQuery('DealFilterFields') })],
        list: [component('list-records', 'dataList', {
            label: 'Deals', rows: fromQuery('Deals'), columns: fromQuery('DealColumns'), titleField: 'name', selectionMode: 'multiple', pageSize: 10, rowActions: ['Open', 'Archive'], urlKey: 'deals',
        })],
        bulkBar: [component('list-bulk', 'bulkBar', { selection: fromQuery('DealSelection'), actions: ['Assign', 'Archive'] })],
        footer: [],
    },
    displayName: 'List',
    description: 'A searchable, filterable collection that is a table, grouped or cards, with a bulk bar for selected rows.',
    metadata: { ...foundationTemplateProvenance, type: 'List', category: 'Foundation / List', thumbnail: thumbnailOf('ListScreen') },
};
