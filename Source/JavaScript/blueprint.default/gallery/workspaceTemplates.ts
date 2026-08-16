// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { SlotName, column, grid, slotLeaf } from '../layouts';
import { TemplateSlotName } from './TemplateSlotName';
import { button, card, externalComponent, text } from './elements';
import { emptyState, field, formActions, pageHeader, statCard, table, widget } from './widgets';

/**
 * The five workhorse shapes inside an application shell: a dashboard, a list, a detail, a form and the
 * designed empty state.
 *
 * Every one fits the layout's `content` slot, and every one carries realistic seeded content rather than
 * placeholder text. A gallery whose dashboard shows four boxes labeled "Card" proves the renderer runs; a
 * gallery whose dashboard shows revenue, orders, customers and a real table proves the blueprint is worth
 * starting an application from.
 */

/**
 * The dashboard: four figures across the top, then two columns of larger widgets.
 *
 * This is Sakai's composition, and the reason to copy it is that it is the arrangement people already read
 * fluently - the eye takes the row of numbers first and then settles into the detail.
 *
 * Its own arrangement collapses the two columns into one at a compact width, because a two-column widget
 * grid on a phone is two columns of unreadable slivers.
 */
export const dashboardTemplate: ScreenTemplate = {
    name: 'Dashboard',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Stats }, { name: TemplateSlotName.Primary }, { name: TemplateSlotName.Secondary }],
    arrangement: {
        root: column([slotLeaf(TemplateSlotName.Stats), grid([slotLeaf(TemplateSlotName.Primary, { span: 2 }), slotLeaf(TemplateSlotName.Secondary)], 3, 16)]),
        overrides: [
            {
                width: WidthSizeClass.Compact,
                root: column([slotLeaf(TemplateSlotName.Stats), slotLeaf(TemplateSlotName.Primary), slotLeaf(TemplateSlotName.Secondary)], 16),
            },
        ],
    },
    content: {
        [TemplateSlotName.Stats]: [
            statCard('stat-revenue', 'Revenue', '$284,120', '+12.4% this month', 'pi pi-dollar'),
            statCard('stat-orders', 'Orders', '1,842', '+3.1% this month', 'pi pi-shopping-cart'),
            statCard('stat-customers', 'Customers', '9,410', '+128 new', 'pi pi-users'),
            statCard('stat-open', 'Open tickets', '17', '-4 since Monday', 'pi pi-inbox'),
        ],
        [TemplateSlotName.Primary]: [
            widget('widget-revenue', 'Revenue over time', [
                table(
                    'revenue-table',
                    [
                        { field: 'month', header: 'Month' },
                        { field: 'revenue', header: 'Revenue' },
                        { field: 'change', header: 'Change' },
                    ],
                    [
                        { month: 'March', revenue: '$284,120', change: '+12.4%' },
                        { month: 'February', revenue: '$252,780', change: '+4.1%' },
                        { month: 'January', revenue: '$242,830', change: '-1.8%' },
                        { month: 'December', revenue: '$247,290', change: '+9.6%' },
                    ],
                ),
            ]),
            widget('widget-orders', 'Recent orders', [
                table(
                    'orders-table',
                    [
                        { field: 'reference', header: 'Reference' },
                        { field: 'customer', header: 'Customer' },
                        { field: 'total', header: 'Total' },
                        { field: 'status', header: 'Status' },
                    ],
                    [
                        { reference: 'ORD-4192', customer: 'Northwind Traders', total: '$1,240.00', status: 'Shipped' },
                        { reference: 'ORD-4191', customer: 'Contoso Ltd', total: '$318.50', status: 'Packing' },
                        { reference: 'ORD-4188', customer: 'Fabrikam', total: '$2,980.00', status: 'Awaiting payment' },
                        { reference: 'ORD-4184', customer: 'Adventure Works', total: '$76.20', status: 'Shipped' },
                    ],
                ),
            ]),
        ],
        [TemplateSlotName.Secondary]: [
            widget('widget-activity', 'Activity', [externalComponent('activity-timeline', 'timeline', { align: 'left' })]),
            widget('widget-capacity', 'Warehouse capacity', [externalComponent('capacity-bar', 'progressBar', { value: 68 })]),
        ],
    },
    displayName: 'Dashboard',
    description: 'Four stat cards over two columns of widgets - the composition every template line opens with.',
};

/** The list: a filter toolbar, a real table, and the row actions a list needs. */
export const crudListTemplate: ScreenTemplate = {
    name: 'CrudList',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Toolbar }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Toolbar]: [
            pageHeader('crud-header', 'Products', '412 products across 9 categories', [
                button('crud-new', 'New product', { severity: 'primary', icon: 'pi pi-plus' }),
                button('crud-import', 'Import', { severity: 'secondary', icon: 'pi pi-upload' }),
            ]),
            externalComponent('crud-search', 'inputText', { placeholder: 'Search products' }),
        ],
        [TemplateSlotName.Body]: [
            table(
                'products-table',
                [
                    { field: 'code', header: 'Code' },
                    { field: 'name', header: 'Name' },
                    { field: 'category', header: 'Category' },
                    { field: 'price', header: 'Price' },
                    { field: 'stock', header: 'In stock' },
                ],
                [
                    { code: 'P-1001', name: 'Bamboo Watch', category: 'Accessories', price: '$65.00', stock: 24 },
                    { code: 'P-1002', name: 'Black Watch', category: 'Accessories', price: '$72.00', stock: 61 },
                    { code: 'P-1003', name: 'Blue Band', category: 'Fitness', price: '$79.00', stock: 2 },
                    { code: 'P-1004', name: 'Blue T-Shirt', category: 'Clothing', price: '$29.00', stock: 25 },
                    { code: 'P-1005', name: 'Bracelet', category: 'Accessories', price: '$15.00', stock: 73 },
                ],
            ),
        ],
    },
    displayName: 'List',
    description: 'A searchable table with a header, primary action and row data.',
};

/** The detail: a summary panel beside the record's own sections. */
export const detailViewTemplate: ScreenTemplate = {
    name: 'DetailView',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }],
    content: {
        [TemplateSlotName.Header]: [
            pageHeader('detail-header', 'Bamboo Watch', 'P-1001 · Accessories', [
                button('detail-edit', 'Edit', { severity: 'primary', icon: 'pi pi-pencil' }),
                button('detail-archive', 'Archive', { severity: 'secondary', icon: 'pi pi-inbox' }),
            ]),
        ],
        [TemplateSlotName.Body]: [
            widget('detail-description', 'Description', [
                text('detail-description-text', 'A bamboo-cased watch with a sapphire face and a recycled steel strap.'),
            ]),
            widget('detail-history', 'Price history', [externalComponent('detail-history-timeline', 'timeline', { align: 'left' })]),
        ],
        [TemplateSlotName.SidePanel]: [
            widget('detail-summary', 'Summary', [
                text('detail-stock', 'In stock: 24'),
                text('detail-reserved', 'Reserved: 3'),
                externalComponent('detail-status', 'tag', { value: 'Active', severity: 'success' }),
            ]),
        ],
    },
    displayName: 'Detail',
    description: 'One record: a header with actions, its sections, and a summary panel.',
};

/** The form: fields, grouped, with the actions that close them. */
export const formPageTemplate: ScreenTemplate = {
    name: 'FormPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [pageHeader('form-header', 'New product', 'Everything marked with an asterisk is required')],
        [TemplateSlotName.Body]: [
            card('form-card', [
                field('form-name', 'Name', 'inputText', { placeholder: 'Bamboo Watch' }),
                field('form-code', 'Code', 'inputText', { placeholder: 'P-1001' }),
                field('form-category', 'Category', 'dropdown', { options: ['Accessories', 'Clothing', 'Fitness'] }),
                field('form-price', 'Price', 'inputNumber', { mode: 'currency', currency: 'USD' }),
                field('form-available', 'Available from', 'calendar', {}),
                field('form-notes', 'Notes', 'inputTextarea', { rows: 4 }),
            ]),
        ],
        [TemplateSlotName.Actions]: [formActions('form-actions', 'Create product')],
    },
    displayName: 'Form',
    description: 'A grouped form with the field types an application actually uses.',
};

/** The empty state: what a list looks like before anything exists, designed rather than apologized for. */
export const emptyTemplate: ScreenTemplate = {
    name: 'Empty',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Body]: [
            emptyState('empty-state', 'No products yet', 'Products you create will show up here, with their stock and pricing.', 'Create the first product'),
        ],
    },
    displayName: 'Empty state',
    description: 'The designed empty state for a list that has nothing in it yet.',
};

/** The five workspace templates. */
export const workspaceTemplates: ScreenTemplate[] = [dashboardTemplate, crudListTemplate, detailViewTemplate, formPageTemplate, emptyTemplate];
