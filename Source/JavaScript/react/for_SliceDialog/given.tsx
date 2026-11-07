// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { ApplicationStructure, ExternalComponent, NavigationModel, SceneElement } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { coreComponents } from '../core';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { SliceCommandField } from '../slices/SliceCommandField';
import { SliceCommandFieldsProvider } from '../slices/SliceCommandFieldsContext';
import { SliceInvoker } from '../slices/SliceInvoker';
import { SliceInvokerProvider } from '../slices/SliceInvokerContext';

export const structure = {
    modules: [{ id: 'sales', name: 'Sales', features: [{ id: 'orders', name: 'Orders', features: [], slices: [
        { id: 'PlaceOrder', name: 'Place order', kind: 'StateChange', command: 'PlaceOrder' },
        { id: 'OrderList', name: 'Order list', kind: 'StateView' },
        { id: 'Ship', name: 'Ship', kind: 'StateChange', command: 'ShipOrder', dialogTemplate: 'ShipDialog' },
    ] }] }],
} as unknown as ApplicationStructure;

export const navigation: NavigationModel = { application: { outlets: [] }, modules: [] };

export const fields: Record<string, SliceCommandField[]> = {
    PlaceOrder: [
        { name: 'customer', type: 'string', required: true },
        { name: 'product', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'express', type: 'boolean', label: 'Express delivery' },
    ],
    ShipOrder: [{ name: 'trackingNumber', type: 'string' }],
};

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

/** A screen with a toolbar of slice buttons - an outlet of actions - the way the specification's orders page has one. */
export const ordersScreen = element('orders', 'core:outletItems', {
    name: 'orders',
    kind: 'actions',
    items: [
        { kind: 'button', id: 'new', title: 'New order', slice: 'sales.orders.PlaceOrder', emphasis: 'primary' },
        { kind: 'button', id: 'ship', title: 'Ship', slice: 'sales.orders.Ship', emphasis: 'quiet' },
        { kind: 'button', id: 'cancel', title: 'Cancel order', emphasis: 'secondary' },
        { kind: 'button', id: 'view', title: 'View', slice: 'sales.orders.OrderList' },
    ],
});

export interface OrdersApplicationProps {
    invoker?: SliceInvoker;
    warnEmptySlices?: boolean;
    dialogs?: Record<string, SceneElement>;
    withModel?: boolean;
    children?: ReactNode;
}

export function OrdersApplication({ invoker, warnEmptySlices, dialogs, withModel = true }: OrdersApplicationProps) {
    const host = <SceneNavigationHost screens={{ Orders: ordersScreen }} initialScreen='Orders' registry={coreComponents} dialogs={dialogs}
        {...(withModel ? { navigationModel: { structure: new ApplicationStructureIndex(structure), navigation } } : {})} />;
    const withFields = <SliceCommandFieldsProvider fieldsFor={command => fields[command] ?? []}>{host}</SliceCommandFieldsProvider>;
    return invoker ? <SliceInvokerProvider invoker={invoker} warnEmptySlices={warnEmptySlices}>{withFields}</SliceInvokerProvider> : withFields;
}
