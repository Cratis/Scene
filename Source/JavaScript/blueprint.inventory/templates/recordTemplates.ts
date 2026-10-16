// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { InventoryEntityKind, InventoryQuery, currencyOfData, fromQuery, inventoryQueriesOf, localeOfData } from '../inventoryQueries';
import { actionButton, component, goesTo, inventoryMetadata, opensDialog, withBehaviors } from '../inventoryParts';

const queries = inventoryQueriesOf(InventoryEntityKind.Item);

/**
 * The item page: the foundation `RecordPage` with the item's name as its title, Adjust stock and Check out as its actions, its key facts under it, the record's
 * fields with the supplier's details, the stock of the item in each location and its movement history as related lists, and the cycle counts to do beside it.
 */
export const inventoryItemPageTemplate: ScreenTemplate = {
    name: 'InventoryItemPage',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('InventoryItemPage-header', 'pageHeader', { title: fromQuery(queries.record, '0.name'), subtitle: 'Item' }, {
            actions: [
                withBehaviors(actionButton('InventoryItemPage-check', 'Check out', 'secondary'), goesTo('inventory.movements.check')),
                withBehaviors(actionButton('InventoryItemPage-adjust', 'Adjust stock', 'primary'), opensDialog('InventoryAdjustStock')),
            ],
        })],
        summary: [
            component('InventoryItemPage-status', 'statusChip', { status: fromQuery(queries.summary, '0.status'), tone: fromQuery(queries.summary, '0.tone') }),
            component('InventoryItemPage-onhand', 'statCard', { label: 'On hand', value: fromQuery(queries.summary, '0.onHand'), ...localeOfData }),
            component('InventoryItemPage-reorder', 'statCard', { label: 'Reorder level', value: fromQuery(queries.summary, '0.reorderLevel'), ...localeOfData }),
            component('InventoryItemPage-value', 'statCard', { label: 'Stock value', value: fromQuery(queries.summary, '0.stockValue'), format: 'currency', fractionDigits: 0, ...currencyOfData }),
        ],
        tabs: [component('InventoryItemPage-tabs', 'tabSet', { tabs: fromQuery(InventoryQuery.RecordTabs), urlKey: 'tab', label: 'Item sections' })],
        main: [component('InventoryItemPage-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(queries.sections), values: fromQuery(queries.record, '0'), ...localeOfData })],
        related: [
            component('InventoryItemPage-stock', 'dataList', { label: 'Stock by location', rows: fromQuery(queries.stockByLocation), columns: fromQuery('StockByLocationColumns'), titleField: 'location', pageSize: 5, ...localeOfData }),
            component('InventoryItemPage-movements', 'dataList', { label: 'Movement history', rows: fromQuery(queries.movements), columns: fromQuery(inventoryQueriesOf(InventoryEntityKind.Movement).columns), titleField: 'item', pageSize: 5, ...localeOfData }),
        ],
        activity: [component('InventoryItemPage-activity', 'activityFeed', { label: 'Activity', entries: fromQuery(queries.activity), ...localeOfData })],
        aside: [component('InventoryItemPage-tasks', 'checklistSection', { label: 'Cycle counts', sections: fromQuery(queries.tasks), ...localeOfData })],
    },
    displayName: 'Inventory item page',
    description: 'One item: key facts, its fields and supplier, its stock by location and its movement history.',
    metadata: inventoryMetadata('InventoryItemPage', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
