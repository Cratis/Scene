// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintScreen } from '@cratis/scene.model';

/** One ready-to-use screen: the qualified name that is also its place in the application (`portal.list.record` would be the `record` feature of `list`). */
export interface CustomerPortalScreenDefinition extends BlueprintScreen {
    template: string;
    description: string;
}

/**
 * The screens the blueprint brings, in navigation order. This one list is what the manifest's screen set, the `Screen` instances, the application structure
 * and the navigation are all derived from, so they cannot disagree about which screens exist or where they sit.
 */
export const customerPortalScreenDefinitions: CustomerPortalScreenDefinition[] = [
    { name: 'portal.home', title: 'Home', template: 'PortalHome', order: 0, description: 'Your account at a glance: open orders, what you owe and what happened lately.' },
    { name: 'portal.orders', title: 'Orders', template: 'PortalOrdersList', order: 1, description: 'Your orders and where each one is.' },
    { name: 'portal.order', title: 'Order', template: 'PortalOrderPage', parent: 'portal.orders', description: 'One order: key facts, its lines, tracking and what happened to it.' },
    { name: 'portal.invoices', title: 'Invoices', template: 'PortalInvoicesList', order: 2, description: 'Your invoices and which ones are still to pay.' },
    { name: 'portal.support', title: 'Support', template: 'PortalSupport', order: 3, description: 'Your conversations with us: questions, reminders and quotes.' },
    { name: 'portal.profile', title: 'Profile', template: 'PortalProfile', order: 4, description: 'Your details, delivery address and preferences.' },
];
