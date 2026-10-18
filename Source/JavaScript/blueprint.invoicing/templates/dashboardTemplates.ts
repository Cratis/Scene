// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { dashboardScreenTemplate } from '@cratis/scene.blueprint.default';
import { InvoicingEntityKind, InvoicingQuery, currencyOfData, fromQuery, localeOfData, invoicingQueriesOf } from '../invoicingQueries';
import { actionButton, component, goesTo, invoicingMetadata, opensDialog, withBehaviors } from '../invoicingParts';

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
        metadata: invoicingMetadata(options.name, 'Dashboard', [TemplateScope.Module, TemplateScope.Feature]),
    };
}

/** The receivables overview: three key figures over two charts - receivables by age and invoiced against collected - with the invoices beneath and the latest activity beside them. */
export const invoicingOverviewTemplate = dashboardOf({
    name: 'InvoicingOverview', displayName: 'Invoicing overview', description: 'Outstanding, overdue and collected this month, receivables by age, invoiced against collected and the invoices to chase.', title: 'Receivables overview', subtitle: 'What is owed and what has come in',
    figures: [
        { id: 'outstanding', label: 'Outstanding', query: InvoicingQuery.Kpis, index: 0, format: 'currency', goodDirection: 'down', comparison: 'last month' },
        { id: 'overdue', label: 'Overdue', query: InvoicingQuery.Kpis, index: 1, format: 'currency', goodDirection: 'down', comparison: 'last month' },
        { id: 'collected', label: 'Collected this month', query: InvoicingQuery.Kpis, index: 2, format: 'currency', comparison: 'last month' },
    ],
    charts: [
        { id: 'aging', title: 'Receivables by age', kind: 'bar', query: InvoicingQuery.Aging },
        { id: 'flow', title: 'Invoiced and collected', kind: 'line', query: InvoicingQuery.InvoicedAndCollected },
    ],
    table: { label: 'Invoices', titleField: 'number', pageSize: 5, rows: invoicingQueriesOf(InvoicingEntityKind.Invoice).rows, columns: invoicingQueriesOf(InvoicingEntityKind.Invoice).columns },
    aside: { kind: 'activity', label: 'Latest activity', query: InvoicingQuery.Activity },
    actions: [{ id: 'new', label: 'New invoice', emphasis: 'primary', dialog: 'InvoicingQuickCreateInvoice' }],
});
