// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`projects.list.record` would be the `record` feature of `list`). */
export interface OrdersScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const ordersScreenDefinitions: OrdersScreenDefinition[] = [
    { name: 'orders.list', title: 'Orders', template: 'OrdersList', order: 0, description: 'Every order with its customer, dates, total and status.' },
    { name: 'orders.record', title: 'Order', template: 'OrderPage', parent: 'orders.list', description: 'One order: key facts, its lines, its shipments and its activity.' },
    { name: 'orders.fulfilment', title: 'Fulfilment', template: 'OrdersFulfilmentBoard', order: 1, description: 'Orders in a column for each fulfilment step.' },
    { name: 'orders.deliveries', title: 'Deliveries', template: 'OrdersDeliveryCalendar', order: 2, description: 'The day each open order is due to arrive, on a calendar.' },
];
