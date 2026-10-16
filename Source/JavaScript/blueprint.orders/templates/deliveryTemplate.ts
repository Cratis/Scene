// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, slotLeaf } from '@cratis/scene.blueprint.default';
import { OrdersQuery, fromQuery, localeOfData } from '../ordersQueries';
import { actionButton, component, goesTo, ordersMetadata, withBehaviors } from '../ordersParts';

/**
 * The delivery calendar: the day each open order is due to arrive, on a month, a week or as an agenda (the foundation's `calendarGrid`). The status is told in
 * words as well as by color, the day and view are kept in the address, and the list beside it names every order due in the period.
 */
export const deliveryCalendarTemplate: ScreenTemplate = {
    name: 'OrdersDeliveryCalendar',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'calendar' }, { name: 'due' }],
    arrangement: {
        root: column([slotLeaf('header'), grid([slotLeaf('calendar', { span: 2 }), slotLeaf('due')], 3, 16)], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('calendar'), slotLeaf('due')], 16) }],
    },
    content: {
        header: [component('OrdersDeliveryCalendar-header', 'pageHeader', { title: 'Deliveries', subtitle: 'When each order is due to arrive' }, {
            actions: [withBehaviors(actionButton('OrdersDeliveryCalendar-orders', 'Open the orders', 'secondary'), goesTo('orders.list'))],
        })],
        calendar: [component('OrdersDeliveryCalendar-grid', 'calendarGrid', { label: 'Deliveries', events: fromQuery(OrdersQuery.DeliveryEvents), date: fromQuery(OrdersQuery.Settings, '0.today'), urlKey: 'day', ...localeOfData })],
        due: [component('OrdersDeliveryCalendar-due', 'dataList', { label: 'Due in this period', rows: fromQuery(OrdersQuery.DeliveryEvents), columns: fromQuery(OrdersQuery.DeliveryColumns), titleField: 'title', pageSize: 6, ...localeOfData })],
    },
    displayName: 'Orders delivery calendar',
    description: 'The day each open order is due to arrive, on a month, a week or as an agenda.',
    metadata: ordersMetadata('OrdersDeliveryCalendar', 'Calendar', [TemplateScope.Module, TemplateScope.Feature]),
};
