// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { SlotName, TemplateSlotName, column, grid, slotLeaf } from '@cratis/scene.blueprint.default';
import { ColumnDefinition } from './ColumnDefinition';
import { adjustmentColumns, dataTable, invoiceColumns, invoiceTableOptions, observableDataTable } from './dataElements';
import { objectContentEditor, timeMachine } from './editorElements';
import { arcPageHeader, page } from './elements';
import { SampleBindingName } from './SampleBindingName';
import { TableOptions } from './TableOptions';

/**
 * The two whole-workspace shapes: a master-detail arrangement, and a dashboard of data widgets.
 *
 * Both are arrangements of *several* bindings rather than one, which is what separates them from the list
 * templates. That is also what makes them the templates most worth shipping: an application can wire one
 * query without help, and gets a page that looks like every other page in the product only if something
 * has already decided how four of them sit together.
 */

/** The columns of the revenue widget's query. */
const revenueColumns: ColumnDefinition[] = [
    { field: 'month', header: 'Month' },
    { field: 'invoiced', header: 'Invoiced' },
    { field: 'collected', header: 'Collected' },
];

/** The columns of the open-tickets widget's query. */
const ticketColumns: ColumnDefinition[] = [
    { field: 'reference', header: 'Reference' },
    { field: 'subject', header: 'Subject' },
    { field: 'age', header: 'Age' },
];

/** Table options for a widget-sized table, where there is no search box to filter across. */
const widgetTableOptions: TableOptions = { emptyMessage: 'Nothing to show yet', dataKey: 'id' };

/**
 * Master and detail: the list in the larger column, the selected record in the narrower one.
 *
 * The difference from `DataListWithDetailPage` is real and worth having both. That template is a whole
 * `dataPage` - its own title bar, menubar and filtering - with a detail region added beside it. This one is
 * a plain `dataTable` next to a detail region, which is the right shape when the page's chrome comes from
 * the *feature* around it rather than from the list itself. Reaching for the wrong one shows up as a page
 * with two toolbars.
 *
 * The grid collapses to a single column at a compact width, because a master and a detail side by side on a
 * phone is the arrangement that made "master-detail does not work on mobile" a truism.
 */
export const masterDetailPageTemplate: ScreenTemplate = {
    name: 'MasterDetailPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Primary }, { name: TemplateSlotName.Secondary }],
    arrangement: {
        root: column([slotLeaf(TemplateSlotName.Header), grid([slotLeaf(TemplateSlotName.Primary, { span: 2 }), slotLeaf(TemplateSlotName.Secondary)], 3, 16)]),
        overrides: [
            {
                width: WidthSizeClass.Compact,
                root: column([slotLeaf(TemplateSlotName.Header), slotLeaf(TemplateSlotName.Primary), slotLeaf(TemplateSlotName.Secondary)], 16),
            },
        ],
    },
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('master-detail-header', {
                title: 'Invoices',
                subtitle: 'Pick an invoice on the left to inspect it on the right',
                section: 'Billing',
                query: SampleBindingName.AllInvoices,
            }),
        ],
        [TemplateSlotName.Primary]: [
            page('master-detail-master', 'Invoices', [dataTable('master-detail-table', SampleBindingName.AllInvoices, invoiceTableOptions, invoiceColumns)]),
        ],
        [TemplateSlotName.Secondary]: [
            page('master-detail-detail', 'Selected invoice', [
                objectContentEditor('master-detail-document', false),
                timeMachine('master-detail-history'),
            ]),
        ],
    },
    displayName: 'Master-detail page',
    description: 'A queried list in the larger column with the selected record and its history in the narrower one.',
};

/**
 * A dashboard of data widgets - four queries arranged so the page reads in the order people already read it.
 *
 * The composition is the one every template line settles on: a row of figures across the top, then a wide
 * column and a narrow one. Copying it is the point rather than a shortcut - it is the arrangement the eye
 * already knows how to scan, and a dashboard that invents its own costs the reader a moment on every visit.
 *
 * What this blueprint adds is that every widget is a *query*, not a picture. Each one names a proxy a host
 * registers, so the dashboard is live the moment the application wires it, with nothing to replace.
 */
export const dashboardPageTemplate: ScreenTemplate = {
    name: 'DashboardPage',
    fitsSlot: SlotName.Content,
    slots: [
        { name: TemplateSlotName.Header },
        { name: TemplateSlotName.Stats },
        { name: TemplateSlotName.Primary },
        { name: TemplateSlotName.Secondary },
    ],
    arrangement: {
        root: column([
            slotLeaf(TemplateSlotName.Header),
            slotLeaf(TemplateSlotName.Stats),
            grid([slotLeaf(TemplateSlotName.Primary, { span: 2 }), slotLeaf(TemplateSlotName.Secondary)], 3, 16),
        ]),
        overrides: [
            {
                width: WidthSizeClass.Compact,
                root: column(
                    [
                        slotLeaf(TemplateSlotName.Header),
                        slotLeaf(TemplateSlotName.Stats),
                        slotLeaf(TemplateSlotName.Primary),
                        slotLeaf(TemplateSlotName.Secondary),
                    ],
                    16,
                ),
            },
        ],
    },
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('dashboard-header', {
                title: 'Billing',
                subtitle: 'Four queries, arranged the way people already read a dashboard',
                section: 'Operations',
                query: SampleBindingName.RevenueByMonth,
            }),
        ],
        [TemplateSlotName.Stats]: [
            page('dashboard-stat-revenue', 'Revenue by month', [
                dataTable('dashboard-stat-revenue-table', SampleBindingName.RevenueByMonth, widgetTableOptions, revenueColumns),
            ]),
            page('dashboard-stat-flight', 'In flight', [
                observableDataTable('dashboard-stat-flight-table', SampleBindingName.InvoicesInFlight, widgetTableOptions, invoiceColumns),
            ]),
            page('dashboard-stat-tickets', 'Open tickets', [
                dataTable('dashboard-stat-tickets-table', SampleBindingName.OpenTickets, widgetTableOptions, ticketColumns),
            ]),
        ],
        [TemplateSlotName.Primary]: [
            page('dashboard-invoices', 'Recent invoices', [
                dataTable('dashboard-invoices-table', SampleBindingName.AllInvoices, invoiceTableOptions, invoiceColumns),
            ]),
        ],
        [TemplateSlotName.Secondary]: [
            page('dashboard-adjustments', 'Adjustments', [
                dataTable('dashboard-adjustments-table', SampleBindingName.AllAdjustments, widgetTableOptions, adjustmentColumns),
            ]),
        ],
    },
    displayName: 'Dashboard page',
    description: 'A row of query-backed widgets over a wide and a narrow column, each bound to its own query.',
};

/** The two workspace-shaped templates. */
export const workspaceTemplates: ScreenTemplate[] = [masterDetailPageTemplate, dashboardPageTemplate];
