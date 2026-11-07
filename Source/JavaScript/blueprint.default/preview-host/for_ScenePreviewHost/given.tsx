// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PrimeReactProvider } from '@primereact/core';
import {
    ApplicationStructure, ExternalComponent, NavigationModel, NavigationRegionKind, OutletItemKind, OutletKind, OutletMode, SampleDataPack, SceneElement, Screen,
} from '@cratis/scene.model';
import { RegisteredComponentProps, coreComponents } from '@cratis/scene.react';
import { defaultBlueprintComponents } from '../../defaultBlueprintComponents';
import { defaultLayouts } from '../../layouts';
import { ApplicationDocument } from '../ApplicationDocument';
import { previewProfile } from '../previewProfile';

/** The application of the specification's preview screenshots: Sales with Orders and Customers, Support with Tickets and a Knowledge base. */
export const structure = {
    modules: [
        { id: 'dashboard', name: 'Dashboard', features: [{ id: 'overview', name: 'Overview', features: [], slices: [] }] },
        { id: 'sales', name: 'Sales', features: [
            { id: 'orders', name: 'Orders', features: [], slices: [
                { id: 'PlaceOrder', name: 'Place order', kind: 'StateChange', command: 'PlaceOrder' },
                { id: 'OrderList', name: 'Order list', kind: 'StateView' },
                { id: 'Reminder', name: 'Reminder', kind: 'Automation' },
            ] },
            { id: 'customers', name: 'Customers', features: [], slices: [{ id: 'Register', name: 'Register', kind: 'StateChange' }] },
        ] },
        { id: 'support', name: 'Support', features: [
            { id: 'tickets', name: 'Tickets', features: [], slices: [] },
            { id: 'kb', name: 'Knowledge base', features: [], slices: [] },
        ] },
        { id: 'empty', name: 'Empty', features: [] },
    ],
} as unknown as ApplicationStructure;

export const navigation: NavigationModel = {
    application: {
        logo: { image: '', title: 'Acme' },
        outlets: [
            { name: NavigationRegionKind.Topbar, kind: OutletKind.Navigation, defaults: [
                { kind: OutletItemKind.Navigation, id: 'dashboard', title: 'Dashboard', target: { module: 'dashboard' } },
                { kind: OutletItemKind.Navigation, id: 'sales', title: 'Sales', target: { module: 'sales' } },
                { kind: OutletItemKind.Navigation, id: 'support', title: 'Support', target: { module: 'support' } },
            ] },
            { name: NavigationRegionKind.Sidebar, kind: OutletKind.Navigation, defaults: [{ kind: OutletItemKind.Navigation, id: 'dashboard', title: 'Dashboard', target: { module: 'dashboard', feature: 'overview' } }] },
        ],
    },
    modules: [
        { module: 'sales', refinements: [{ outlet: NavigationRegionKind.Sidebar, mode: OutletMode.Overrides, items: [
            { kind: OutletItemKind.Navigation, id: 'orders', title: 'Orders', target: { module: 'sales', feature: 'orders' } },
            { kind: OutletItemKind.Navigation, id: 'customers', title: 'Customers', target: { module: 'sales', feature: 'customers' } },
        ] }] },
        { module: 'support', refinements: [
            { outlet: NavigationRegionKind.Topbar, mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Navigation, id: 'help', title: 'Help center', target: { module: 'support', feature: 'kb' } }] },
            { outlet: NavigationRegionKind.Sidebar, mode: OutletMode.Overrides, items: [
                { kind: OutletItemKind.Navigation, id: 'tickets', title: 'Tickets', target: { module: 'support', feature: 'tickets' } },
                { kind: OutletItemKind.Navigation, id: 'kb', title: 'Knowledge base', target: { module: 'support', feature: 'kb' } },
            ] },
        ] },
    ],
};

export const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

function Page({ element: page, slots }: RegisteredComponentProps) {
    return <section data-page={page.id}><h1>{String(page.properties.title ?? page.id)}</h1>{slots.content}</section>;
}

function Grid({ element: grid }: RegisteredComponentProps) {
    return <table data-grid={String(grid.properties.query)}><tbody><tr><td>{String(grid.properties.query)}</td></tr></tbody></table>;
}

export const registry = { ...coreComponents, ...defaultBlueprintComponents, 'test:page': Page, 'test:grid': Grid };

const screen = (name: string, content: SceneElement[], template?: string): Screen => ({
    name, layout: 'AppShell', slotContent: { content }, forms: [], contributions: [], ...(template === undefined ? {} : { screenTemplate: template }),
});

const ordersToolbar = element('orders-toolbar', 'core:outletItems', { name: 'orders', kind: 'actions', items: [
    { kind: 'button', id: 'new', title: 'New order', slice: 'sales.orders.PlaceOrder', emphasis: 'primary' },
    { kind: 'button', id: 'cancel', title: 'Cancel order', emphasis: 'secondary' },
] });

export function ordersApplication(): ApplicationDocument {
    return {
        layouts: defaultLayouts,
        screenTemplates: [],
        screens: [
            screen('dashboard.overview', [element('overview', 'test:page', { title: 'Overview' })]),
            screen('sales.orders', [
                element('orders', 'test:page', { title: 'Orders' }, { content: [ordersToolbar, element('orders-grid', 'test:grid', { query: 'Orders' })] }),
                element('order-list', 'test:grid', { query: 'OrderList' }),
            ]),
            screen('sales.customers', [element('customers', 'test:page', { title: 'Customers' })]),
            screen('support.tickets', [element('tickets', 'test:page', { title: 'Tickets' }, { content: [element('side', 'core:slot', { name: 'side' })] })]),
            screen('support.kb', [element('kb', 'test:page', { title: 'Knowledge base' })]),
        ],
        uiProfiles: [{ ...previewProfile(undefined), name: 'Acme', sampleData: { activePack: 'nordic-smb', mappings: [], bindings: [] } }],
    };
}

/** The demo data of the specification's dialog: a customer and a product, each with a distinguishing value. */
export const nordicPack: SampleDataPack = {
    id: 'nordic-smb', title: 'CRM · Nordic SMB', locale: 'nb-NO', owner: 'blueprint',
    sets: [{ shape: 'PlaceOrder', rows: [{ customer: 'Fjordline AS', product: 'Scanner', quantity: 4 }] }],
};

export const otherPack: SampleDataPack = {
    id: 'other', title: 'Other', locale: 'en-GB', owner: 'own',
    sets: [{ shape: 'PlaceOrder', rows: [{ customer: 'Northwind', product: 'Printer', quantity: 1 }] }],
};

export const commandFields = (command: string) => command === 'PlaceOrder'
    ? [{ name: 'customer', type: 'string', required: true }, { name: 'product', type: 'string' }, { name: 'quantity', type: 'number' }]
    : [];

export function withPrime(node: React.ReactNode) {
    return <PrimeReactProvider>{node}</PrimeReactProvider>;
}
