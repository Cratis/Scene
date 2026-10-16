// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { masterDetailScreenTemplate } from '@cratis/scene.blueprint.default';
import { InventoryQuery, fromQuery, localeOfData } from '../inventoryQueries';
import { actionButton, component, inventoryMetadata, opensDialog, withBehaviors } from '../inventoryParts';

/**
 * The locations: the foundation `MasterDetail` with the tree of locations - warehouse, aisle, shelf - on the left and, on the right, what is stored in the one
 * chosen, or in everything beneath it. The tree keeps the chosen location in the address under the parameter the contents list searches by, and a
 * location's id is its path, so the contents are every row whose location starts with it - and a link or a refresh restores the choice. On a phone the two become a navigation stack. It fills the shell's `content` slot itself
 * rather than the module workspace's, so a module without a workspace can use it.
 */
export const inventoryLocationsTemplate: ScreenTemplate = {
    name: 'InventoryLocations',
    fitsSlot: 'content',
    slots: masterDetailScreenTemplate.slots,
    arrangement: masterDetailScreenTemplate.arrangement,
    content: {
        list: [component('inventory-locations-tree', 'orgTree', {
            nodes: fromQuery(InventoryQuery.LocationNodes), expandedDepth: 2, urlKey: 'contentsq', strings: { orgTree: 'Locations', orgReports: '{count} locations beneath' }, ...localeOfData,
        })],
        details: [
            component('inventory-locations-header', 'pageHeader', { title: 'Contents', subtitle: 'What is stored in the chosen location and beneath it' }, {
                actions: [withBehaviors(actionButton('inventory-locations-adjust', 'Adjust stock', 'primary'), opensDialog('InventoryAdjustStock'))],
            }),
            component('inventory-locations-contents', 'dataList', {
                label: 'Location contents', rows: fromQuery(InventoryQuery.LocationContents), columns: fromQuery(InventoryQuery.LocationContentColumns), titleField: 'name', pageSize: 10, toneField: 'tone', urlKey: 'contents', ...localeOfData,
            }),
        ],
    },
    displayName: 'Inventory locations',
    description: 'The tree of locations beside what is stored in the chosen location.',
    metadata: inventoryMetadata('InventoryLocations', 'Workspace', [TemplateScope.Module, TemplateScope.Feature]),
};
