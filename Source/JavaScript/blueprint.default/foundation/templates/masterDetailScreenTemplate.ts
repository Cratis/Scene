// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, OutletKind, OutletSubject, ScreenTemplate, SlotRole, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The master/detail: a list beside the selected record. The selection lives in the address, so a link opens a record and the back button returns to the
 * list; on a phone the two become a navigation stack - the list, then the record with a way back. It lives in a module workspace's `moduleContent`.
 */
export const masterDetailScreenTemplate: ScreenTemplate = {
    name: 'MasterDetailScreen',
    fitsSlot: 'WorkspaceScreen.moduleContent',
    slots: [{ name: 'list' }, { name: 'details' }, { name: 'master-detail.detail', description: 'The selected record.', role: SlotRole.Pane, routed: true, routedBy: ['id'], optional: true, accepts: ['Detail'] }],
    arrangement: {
        root: grid([slotLeaf('list'), slotLeaf('details', { span: 2 })], 3, 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('list'), slotLeaf('details')], 16) }],
    },
    content: {
        list: [component('md-list', 'dataList', { label: 'Accounts', rows: fromQuery('Deals'), columns: fromQuery('DealColumns'), titleField: 'name', selectionMode: 'single', urlKey: 'md' })],
        details: [component('md-detail', 'tabSet', { tabs: fromQuery('RecordTabs'), urlKey: 'mdtab', label: 'Account' })],
    },
    outlets: [
        { name: 'rowActions', kind: OutletKind.Actions, subject: OutletSubject.Item, defaults: [] },
        {
            name: 'detailTabs', kind: OutletKind.Tabs, slot: 'master-detail.detail',
            defaults: [{ kind: OutletItemKind.Tab, id: 'overview', title: 'Overview', shows: 'Overview' }],
        },
    ],
    displayName: 'Master/detail with address selection',
    description: 'A list beside the selected record that stacks into a navigation stack on a phone.',
    metadata: { ...foundationTemplateProvenance, type: 'Workspace', category: 'Foundation / Workspace', thumbnail: thumbnailOf('MasterDetailScreen') },
};
