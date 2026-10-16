// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';
import { actionButton } from './dialogTemplates';

/**
 * The report viewer (spec Part B 2.12): a report read as figures, a chart and the rows behind them, narrowed by parameters and handed on as a file. The parameters
 * are a filter, so a link carries the report as it was run; every region has its own states, so a report whose chart failed still shows its table. On a phone the
 * rows are cards.
 */
export const reportViewerTemplate: ScreenTemplate = {
    name: 'ReportViewer',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'parameters' }, { name: 'actions' }, { name: 'figures' }, { name: 'chart' }, { name: 'table' }],
    arrangement: {
        root: column([slotLeaf('header'), slotLeaf('parameters'), row([slotLeaf('actions')], 8), slotLeaf('figures'), slotLeaf('chart'), slotLeaf('table')], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('parameters'), slotLeaf('actions'), slotLeaf('figures'), slotLeaf('chart'), slotLeaf('table')], 16) }],
    },
    content: {
        header: [component('report-header', 'pageHeader', { title: 'Deals by owner', subtitle: 'Run for the current quarter' })],
        parameters: [component('report-parameters', 'filterBuilder', { fields: fromQuery('DealFilterFields') })],
        actions: [
            actionButton('report-export-csv', { label: 'Export as CSV', emphasis: 'secondary' }),
            actionButton('report-export-pdf', { label: 'Export as PDF', emphasis: 'secondary' }),
            actionButton('report-print', { label: 'Print', emphasis: 'quiet' }),
        ],
        figures: [
            component('report-total', 'statCard', { label: 'Total value', value: fromQuery('Kpis', '0.value'), change: fromQuery('Kpis', '0.change'), format: 'currency', currency: 'USD', comparison: 'last quarter' }),
            component('report-count', 'statCard', { label: 'Deals', value: fromQuery('Kpis', '1.value'), change: fromQuery('Kpis', '1.change'), comparison: 'last quarter' }),
        ],
        chart: [component('report-chart', 'chartWrapper', { title: 'Value by quarter', kind: 'bar', categories: fromQuery('RevenueChart', '0.categories'), series: fromQuery('RevenueChart', '0.series') })],
        table: [component('report-rows', 'dataList', { label: 'Deals in this report', rows: fromQuery('Deals'), columns: fromQuery('DealColumns'), titleField: 'name', pageSize: 10, urlKey: 'report' })],
    },
    displayName: 'Report viewer',
    description: 'A report as figures, a chart and the rows behind them, narrowed by parameters and exported as a file.',
    metadata: { ...foundationTemplateProvenance, type: 'Report', category: 'Foundation / Report', thumbnail: thumbnailOf('ReportViewer') },
};
