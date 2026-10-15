// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The master/detail: a list beside the selected record. The selection lives in the address, so a link opens a record and the back button returns to the
 * list; on a phone the two become a navigation stack - the list, then the record with a way back. It lives in a module workspace's `moduleContent`.
 */
export const masterDetailScreenTemplate: ScreenTemplate = {
    name: 'MasterDetailScreen',
    fitsSlot: 'WorkspaceScreen.moduleContent',
    slots: [{ name: 'list' }, { name: 'details' }],
    arrangement: {
        root: grid([slotLeaf('list'), slotLeaf('details', { span: 2 })], 3, 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('list'), slotLeaf('details')], 16) }],
    },
    content: {
        list: [component('md-list', 'dataList', { label: 'Accounts', rows: fromQuery('Deals'), columns: fromQuery('DealColumns'), titleField: 'name', selectionMode: 'single', urlKey: 'md' })],
        details: [component('md-detail', 'tabSet', { tabs: fromQuery('RecordTabs'), urlKey: 'mdtab', label: 'Account' })],
    },
    displayName: 'Master/detail with address selection',
    description: 'A list beside the selected record that stacks into a navigation stack on a phone.',
    outlets: [{ name: 'master-detail.detail', description: 'The selected record.', accepts: ['Detail'] }],
    metadata: { ...foundationTemplateProvenance, type: 'Workspace', category: 'Foundation / Workspace', thumbnail: thumbnailOf('MasterDetailScreen') },
};
