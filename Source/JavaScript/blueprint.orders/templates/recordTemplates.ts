// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { recordPageTemplate } from '@cratis/scene.blueprint.default';
import { OrdersEntityKind, OrdersQuery, fromQuery, localeOfData, ordersQueriesOf, currencyOfData } from '../ordersQueries';
import { actionButton, component, goesTo, ordersMetadata, withBehaviors } from '../ordersParts';

const order = ordersQueriesOf(OrdersEntityKind.Order);

/**
 * The order page: the foundation `RecordPage` with the order number as its title, its status, total and days to delivery as key facts, the order's fields, its
 * lines and shipments in the main region, and the activity beside it.
 */
export const orderPageTemplate: ScreenTemplate = {
    name: 'OrderPage',
    fitsSlot: 'content',
    slots: recordPageTemplate.slots,
    arrangement: recordPageTemplate.arrangement,
    content: {
        header: [component('OrderPage-header', 'pageHeader', { title: fromQuery(order.record, '0.number'), subtitle: fromQuery(order.record, '0.summary') }, {
            actions: [withBehaviors(actionButton('OrderPage-back', 'Back to orders', 'secondary'), goesTo('orders.list'))],
        })],
        summary: [
            component('OrderPage-status', 'statusChip', { status: fromQuery(order.summary, '0.status'), tone: fromQuery(order.summary, '0.tone') }),
            component('OrderPage-total', 'statCard', { label: 'Order total', value: fromQuery(order.summary, '0.total'), format: 'currency', ...currencyOfData }),
            component('OrderPage-items', 'statCard', { label: 'Items', value: fromQuery(order.summary, '0.items'), ...localeOfData }),
            component('OrderPage-days', 'statCard', { label: 'Days to delivery', value: fromQuery(order.summary, '0.daysToDelivery'), ...localeOfData }),
        ],
        tabs: [component('OrderPage-tabs', 'tabSet', { tabs: fromQuery(OrdersQuery.RecordTabs), urlKey: 'tab', label: 'Order sections' })],
        main: [
            component('OrderPage-form', 'formScreenBody', { mode: 'readOnly', sections: fromQuery(order.sections), values: fromQuery(order.record, '0'), ...currencyOfData }),
            component('OrderPage-lines', 'dataList', { label: 'Order lines', rows: fromQuery(OrdersQuery.Lines), columns: fromQuery(OrdersQuery.LineColumns), titleField: 'name', pageSize: 8, ...currencyOfData }),
            component('OrderPage-shipments', 'dataList', { label: 'Shipments', rows: fromQuery(OrdersQuery.Shipments), columns: fromQuery(OrdersQuery.ShipmentColumns), titleField: 'reference', ...localeOfData }),
        ],
        related: [],
        activity: [component('OrderPage-activity', 'activityFeed', { label: 'Activity', entries: fromQuery(order.activity), ...localeOfData })],
        aside: [],
    },
    displayName: 'Order page',
    description: 'One order: key facts, its lines and shipments, and its activity.',
    metadata: ordersMetadata('OrderPage', 'Detail', [TemplateScope.Feature, TemplateScope.Subfeature]),
};
