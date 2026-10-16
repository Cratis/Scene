// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { dashboardScreenTemplate } from '@cratis/scene.blueprint.default';
import { InventoryEntityKind, InventoryQuery, currencyOfData, fromQuery, inventoryQueriesOf, localeOfData } from '../inventoryQueries';
import { component, inventoryMetadata } from '../inventoryParts';

/**
 * The inventory dashboard (the foundation Dashboard, Operational variant): what is running low and what the stock is worth as key figures, the items
 * that move most as a chart, the movements of the last days beneath, and the items to reorder beside them. Every region is its own component with its own
 * loading, empty and error states, so one failed query leaves the others.
 */
export const inventoryDashboardTemplate: ScreenTemplate = {
    name: 'InventoryDashboard',
    fitsSlot: 'content',
    slots: dashboardScreenTemplate.slots,
    arrangement: dashboardScreenTemplate.arrangement,
    content: {
        header: [component('inventory-dashboard-header', 'pageHeader', { title: 'Inventory dashboard', subtitle: 'Stock levels and movements this week' })],
        kpis: [
            component('inventory-kpi-low', 'statCard', {
                label: 'Low stock items', value: fromQuery(InventoryQuery.Kpis, '0.value'), change: fromQuery(InventoryQuery.Kpis, '0.change'), goodDirection: 'down', comparison: 'last week', ...localeOfData,
            }),
            component('inventory-kpi-value', 'statCard', {
                label: 'Stock value', value: fromQuery(InventoryQuery.Kpis, '1.value'), change: fromQuery(InventoryQuery.Kpis, '1.change'), format: 'currency', fractionDigits: 0, comparison: 'last week', ...currencyOfData,
            }),
            component('inventory-kpi-movements', 'statCard', {
                label: 'Movements this week', value: fromQuery(InventoryQuery.Kpis, '2.value'), change: fromQuery(InventoryQuery.Kpis, '2.change'), comparison: 'last week', ...localeOfData,
            }),
        ],
        charts: [component('inventory-chart-movers', 'chartWrapper', {
            title: 'Top movers', kind: 'bar', categories: fromQuery(InventoryQuery.TopMovers, '0.categories'), series: fromQuery(InventoryQuery.TopMovers, '0.series'), ...localeOfData,
        })],
        tables: [component('inventory-dashboard-movements', 'dataList', {
            label: 'Recent movements', rows: fromQuery(InventoryQuery.RecentMovements), columns: fromQuery(inventoryQueriesOf(InventoryEntityKind.Movement).columns), titleField: 'item', pageSize: 5, ...localeOfData,
        })],
        aside: [component('inventory-dashboard-low', 'dataList', {
            label: 'Reorder soon', rows: fromQuery(InventoryQuery.LowStock), columns: fromQuery(inventoryQueriesOf(InventoryEntityKind.Item).columns), titleField: 'name', toneField: 'tone', pageSize: 5, ...localeOfData,
        })],
    },
    displayName: 'Inventory dashboard',
    description: 'Low stock count, stock value, top movers, recent movements and the items to reorder.',
    metadata: inventoryMetadata('InventoryDashboard', 'Dashboard', [TemplateScope.Module, TemplateScope.Feature]),
};
