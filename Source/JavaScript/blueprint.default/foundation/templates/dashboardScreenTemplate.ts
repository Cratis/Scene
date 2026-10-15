// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The dashboard: key figures across the top, charts and tables below, an aside for what needs attention. Every region is its own component with its
 * own five states, so one failed query shows the other regions - the page never fails as a whole.
 */
export const dashboardScreenTemplate: ScreenTemplate = {
    name: 'DashboardScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'kpis' }, { name: 'charts' }, { name: 'tables' }, { name: 'aside' }],
    arrangement: {
        root: column([slotLeaf('header'), slotLeaf('kpis'), grid([slotLeaf('charts', { span: 2 }), slotLeaf('aside')], 3, 16), slotLeaf('tables')], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('kpis'), slotLeaf('charts'), slotLeaf('tables'), slotLeaf('aside')], 16) }],
    },
    content: {
        header: [component('dashboard-header', 'pageHeader', { title: 'Sales overview', subtitle: 'This quarter compared to last' })],
        kpis: [
            component('kpi-pipeline', 'statCard', { label: 'Open pipeline', value: fromQuery('Kpis', '0.value'), change: fromQuery('Kpis', '0.change'), format: 'currency', currency: 'USD', comparison: 'last quarter' }),
            component('kpi-won', 'statCard', { label: 'Deals won', value: fromQuery('Kpis', '1.value'), change: fromQuery('Kpis', '1.change'), comparison: 'last quarter' }),
            component('kpi-response', 'statCard', { label: 'Response time (hours)', value: fromQuery('Kpis', '2.value'), change: fromQuery('Kpis', '2.change'), goodDirection: 'down', comparison: 'last quarter' }),
        ],
        charts: [
            component('chart-revenue', 'chartWrapper', { title: 'Revenue by quarter', kind: 'line', categories: fromQuery('RevenueChart', '0.categories'), series: fromQuery('RevenueChart', '0.series') }),
            component('chart-stages', 'chartWrapper', { title: 'Deals by stage', kind: 'funnel', categories: fromQuery('StageChart', '0.categories'), series: fromQuery('StageChart', '0.series') }),
        ],
        tables: [component('dashboard-deals', 'dataList', { label: 'Closing soon', rows: fromQuery('Deals'), columns: fromQuery('DealColumns'), titleField: 'name', pageSize: 5 })],
        aside: [component('dashboard-activity', 'activityFeed', { label: 'Recent activity', entries: fromQuery('Activity') })],
    },
    displayName: 'Dashboard',
    description: 'Key figures, charts and tables, each region with its own loading, empty and error states.',
    metadata: { ...foundationTemplateProvenance, type: 'Dashboard', category: 'Foundation / Dashboard', thumbnail: thumbnailOf('DashboardScreen') },
};
