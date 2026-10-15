// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, NavigationRegionMode } from '@cratis/scene.model';

/** The sales and support application of the specification's screenshots: a topbar of modules, a sidebar per module. */
export const structure: ApplicationStructure = {
    modules: [
        { id: 'dashboard', name: 'Dashboard', features: [{ id: 'overview', name: 'Overview', features: [], slices: [] }] },
        { id: 'sales', name: 'Sales', features: [
            { id: 'orders', name: 'Orders', features: [{ id: 'returns', name: 'Returns', features: [], slices: [] }], slices: [] },
            { id: 'customers', name: 'Customers', features: [], slices: [] },
        ] },
        { id: 'support', name: 'Support', features: [
            { id: 'tickets', name: 'Tickets', features: [], slices: [] },
            { id: 'kb', name: 'Knowledge base', features: [], slices: [] },
        ] },
    ],
} as unknown as ApplicationStructure;

export const navigation: NavigationModel = {
    application: { regions: [
        { region: NavigationRegionKind.Topbar, items: [
            { id: 'dashboard', title: 'Dashboard', target: { module: 'dashboard' } },
            { id: 'sales', title: 'Sales', target: { module: 'sales' } },
            { id: 'support', title: 'Support', target: { module: 'support' } },
        ] },
        { region: NavigationRegionKind.Sidebar, items: [{ id: 'dashboard', title: 'Dashboard', target: { module: 'dashboard', feature: 'overview' } }] },
    ] },
    modules: [
        { module: 'sales', regions: [{ region: NavigationRegionKind.Sidebar, mode: NavigationRegionMode.Override, items: [
            { id: 'orders', title: 'Orders', target: { module: 'sales', feature: 'orders' }, children: [
                { id: 'returns', title: 'Returns', target: { module: 'sales', feature: 'orders.returns' } },
            ] },
            { id: 'customers', title: 'Customers', target: { module: 'sales', feature: 'customers' } },
        ] }] },
        { module: 'support', regions: [
            { region: NavigationRegionKind.Topbar, mode: NavigationRegionMode.Extend, items: [{ id: 'help', title: 'Help center', target: { module: 'support', feature: 'kb' }, slot: 'side' }] },
            { region: NavigationRegionKind.Sidebar, mode: NavigationRegionMode.Override, items: [
                { id: 'tickets', title: 'Tickets', target: { module: 'support', feature: 'tickets' } },
                { id: 'kb', title: 'Knowledge base', target: { module: 'support', feature: 'kb' }, slot: 'side' },
            ] },
        ] },
    ],
};
