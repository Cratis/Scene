// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { dashboardScreenTemplate } from '@cratis/scene.blueprint.default';
import { CustomerPortalEntityKind, CustomerPortalQuery, currencyOfData, fromQuery, localeOfData, customerPortalQueriesOf } from '../customerPortalQueries';
import { actionButton, component, goesTo, customerPortalMetadata, opensDialog, withBehaviors } from '../customerPortalParts';

interface KeyFigure { id: string; label: string; query: string; index: number; format?: 'currency' | 'percent'; fractionDigits?: number; goodDirection?: 'up' | 'down'; comparison: string }
interface Chart { id: string; title: string; kind: 'bar' | 'line' | 'donut' | 'funnel'; query: string }
interface Action { id: string; label: string; emphasis: 'primary' | 'secondary' | 'quiet' | 'danger'; dialog?: string; screen?: string }

interface DashboardOptions {
    name: string;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    figures: KeyFigure[];
    charts: Chart[];
    table: { label: string; rows: string; columns: string; titleField: string; pageSize: number };
    aside: { kind: 'activity'; label: string; query: string } | { kind: 'checklist'; label: string; query: string };
    actions: Action[];
}

/**
 * One dashboard: the foundation `DashboardScreen` - key figures over two charts, a table beneath and a list beside - with every region its own component with its own
 * loading, empty and error states, so one failed query leaves the others on the page.
 */
function dashboardOf(options: DashboardOptions): ScreenTemplate {
    const id = options.name;
    return {
        name: options.name,
        fitsSlot: 'content',
        slots: dashboardScreenTemplate.slots,
        arrangement: dashboardScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, {
                actions: options.actions.map(action => withBehaviors(actionButton(`${id}-${action.id}`, action.label, action.emphasis), action.dialog ? opensDialog(action.dialog) : goesTo(action.screen!))),
            })],
            kpis: options.figures.map(figure => component(`${id}-${figure.id}`, 'statCard', {
                label: figure.label, value: fromQuery(figure.query, `${figure.index}.value`), change: fromQuery(figure.query, `${figure.index}.change`), comparison: figure.comparison,
                ...(figure.format ? { format: figure.format } : {}), ...(figure.fractionDigits === undefined ? {} : { fractionDigits: figure.fractionDigits }), ...(figure.goodDirection ? { goodDirection: figure.goodDirection } : {}), ...currencyOfData,
            })),
            charts: options.charts.map(chart => component(`${id}-${chart.id}`, 'chartWrapper', {
                title: chart.title, kind: chart.kind, categories: fromQuery(chart.query, '0.categories'), series: fromQuery(chart.query, '0.series'), ...localeOfData,
            })),
            tables: [component(`${id}-table`, 'dataList', {
                label: options.table.label, rows: fromQuery(options.table.rows), columns: fromQuery(options.table.columns), titleField: options.table.titleField, pageSize: options.table.pageSize, ...localeOfData,
            })],
            aside: [options.aside.kind === 'activity'
                ? component(`${id}-aside`, 'activityFeed', { label: options.aside.label, entries: fromQuery(options.aside.query), ...localeOfData })
                : component(`${id}-aside`, 'checklistSection', { label: options.aside.label, sections: fromQuery(options.aside.query), ...localeOfData })],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: customerPortalMetadata(options.name, 'Dashboard', [TemplateScope.Module, TemplateScope.Feature]),
    };
}

/** The portal home: three key figures over a chart of spend by month, the customer's latest orders beneath and what happened lately beside them. */
export const portalHomeTemplate = dashboardOf({
    name: 'PortalHome', displayName: 'Portal home', description: 'Open orders, what is owed, open support requests, spend by month, your latest orders and what happened lately.', title: 'Your account', subtitle: 'Your orders, invoices and requests',
    figures: [
        { id: 'orders', label: 'Open orders', query: CustomerPortalQuery.PortalKpis, index: 0, comparison: 'last month' },
        { id: 'owed', label: 'To pay', query: CustomerPortalQuery.PortalKpis, index: 1, format: 'currency', goodDirection: 'down', comparison: 'last month' },
        { id: 'requests', label: 'Open requests', query: CustomerPortalQuery.PortalKpis, index: 2, goodDirection: 'down', comparison: 'last month' },
    ],
    charts: [
        { id: 'spend', title: 'Spend by month', kind: 'bar', query: CustomerPortalQuery.PortalSpendByMonth },
        { id: 'spend-line', title: 'Spend trend', kind: 'line', query: CustomerPortalQuery.PortalSpendByMonth },
    ],
    table: { label: 'Your latest orders', titleField: 'number', pageSize: 5, rows: customerPortalQueriesOf(CustomerPortalEntityKind.PortalOrder).rows, columns: customerPortalQueriesOf(CustomerPortalEntityKind.PortalOrder).columns },
    aside: { kind: 'activity', label: 'What happened lately', query: CustomerPortalQuery.PortalActivity },
    actions: [{ id: 'help', label: 'Ask for help', emphasis: 'primary', dialog: 'PortalNewSupportRequest' }],
});
