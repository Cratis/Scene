// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { SlotName, TemplateSlotName, column, row, slotLeaf } from '@cratis/scene.blueprint.default';
import { dataPage, invoiceColumns, invoiceTableOptions, observableDataTable } from './dataElements';
import { objectContentEditor, objectNavigationalBar, timeMachine } from './editorElements';
import { arcPageHeader, page, toolbar, toolbarButton, toolbarGroup, toolbarSeparator } from './elements';
import { SampleBindingName } from './SampleBindingName';

/**
 * The three list shapes an Arc application repeats: a list, a live list, and a list with the selected
 * record beside it.
 *
 * All three fill the application shell's `content` slot, which is the only slot the default blueprint's
 * `AppShell` layout declares for a screen - so an application that has picked the default blueprint can
 * drop any of these in without arranging anything.
 *
 * What makes them worth shipping is what is *already wired*. A list page is not "a table in a slot"; it is
 * a query name, a set of columns, an empty message, a data key, a filter field list, a header that states
 * what the page is bound to, and an action bar. Every one of those is a decision, and repeating all seven
 * per screen is how a list page ends up subtly different on every screen of an application.
 */

/**
 * The archetype: a `dataPage` filling the body, under a header that says what it is bound to.
 *
 * `dataPage` is the single highest-leverage name `Cratis.Components` exposes - the library's whole
 * list-screen composite, with its title bar, menubar, filterable table and optional details pane driven
 * from one query. Building the same thing out of a `table` and a `toolbar` in a screen is pages of
 * modeling for a worse result, and this template is the answer to that: an application supplies a query
 * name and has a working list page.
 */
export const dataListPageTemplate: ScreenTemplate = {
    name: 'DataListPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader(
                'data-list-header',
                { title: 'Invoices', subtitle: 'Every invoice, filterable and paged against the server', section: 'Billing', query: SampleBindingName.AllInvoices },
                [
                    toolbar('data-list-actions', [
                        toolbarButton('data-list-new', 'Register an invoice', 'pi pi-plus', 'New'),
                        toolbarButton('data-list-refresh', 'Refresh', 'pi pi-refresh'),
                        toolbarSeparator('data-list-separator'),
                        toolbarGroup('data-list-export', [
                            toolbarButton('data-list-download', 'Download as CSV', 'pi pi-download'),
                            toolbarButton('data-list-print', 'Print', 'pi pi-print'),
                        ]),
                    ]),
                ],
            ),
        ],
        [TemplateSlotName.Body]: [dataPage('data-list-body', SampleBindingName.AllInvoices, invoiceTableOptions, invoiceColumns)],
    },
    displayName: 'Data list page',
    description: 'A dataPage bound to one query, under a header that states the binding - the whole list screen in two elements.',
};

/**
 * The live variant: the same page shape over an observable query.
 *
 * A separate template rather than a flag, for the same reason `observableDataTable` is a separate name
 * from `dataTable`: the difference lives in the *proxy* a host registers, not in how the page is
 * configured. An observable query opens a subscription and the page re-renders when the read model
 * changes on the server. Choosing this template is an application saying its data is live, and that is a
 * decision worth being able to read off the screen rather than infer from a property.
 */
export const observableDataListPageTemplate: ScreenTemplate = {
    name: 'ObservableDataListPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('observable-list-header', {
                title: 'Invoices in flight',
                subtitle: 'Updates as the read model changes - no refresh button, because there is nothing to refresh',
                section: 'Billing',
                query: SampleBindingName.InvoicesInFlight,
            }),
        ],
        [TemplateSlotName.Body]: [
            page('observable-list-body', 'In flight', [
                observableDataTable('observable-list-table', SampleBindingName.InvoicesInFlight, invoiceTableOptions, invoiceColumns),
            ]),
        ],
    },
    displayName: 'Observable data list page',
    description: 'A live list over an observable query, which re-renders when the read model changes on the server.',
};

/**
 * List plus detail: the whole list screen, with the selected record's document and history beside it.
 *
 * The detail region is built from the library's Arc-free editors, which is the interesting part. They read
 * their content out of the property bag rather than from a query, so this half of the page renders fully
 * at design time while the list half is still a placeholder - and in an event-sourced application the
 * record's *history* is as natural a thing to show as its current values, which is why the time machine is
 * here rather than in some optional extra.
 *
 * Its arrangement drops the detail column below the list at a compact width, because a document editor and
 * a paged table side by side on a phone are two unreadable slivers.
 */
export const dataListWithDetailPageTemplate: ScreenTemplate = {
    name: 'DataListWithDetailPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }],
    arrangement: {
        root: column([slotLeaf(TemplateSlotName.Header), row([slotLeaf(TemplateSlotName.Body, { grow: 2 }), slotLeaf(TemplateSlotName.SidePanel, { grow: 1 })], 16)]),
        overrides: [
            {
                width: WidthSizeClass.Compact,
                root: column([slotLeaf(TemplateSlotName.Header), slotLeaf(TemplateSlotName.Body), slotLeaf(TemplateSlotName.SidePanel)], 16),
            },
        ],
    },
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('list-detail-header', {
                title: 'Invoices',
                subtitle: 'The list, with the selected invoice beside it',
                section: 'Billing',
                query: SampleBindingName.AllInvoices,
            }),
        ],
        [TemplateSlotName.Body]: [dataPage('list-detail-body', SampleBindingName.AllInvoices, invoiceTableOptions, invoiceColumns)],
        [TemplateSlotName.SidePanel]: [
            page('list-detail-panel', 'Selected invoice', [
                objectNavigationalBar('list-detail-trail'),
                objectContentEditor('list-detail-document', false),
                timeMachine('list-detail-history'),
            ]),
        ],
    },
    displayName: 'Data list with detail page',
    description: 'A dataPage beside a detail region showing the selected record document and its history.',
};

/** The three list-shaped templates. */
export const listTemplates: ScreenTemplate[] = [dataListPageTemplate, observableDataListPageTemplate, dataListWithDetailPageTemplate];
