// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, NavigationModel, NavigationRegionKind, OutletItemKind, OutletKind, OutletMode } from '@cratis/scene.model';

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
    application: { outlets: [
        { name: NavigationRegionKind.Topbar, kind: OutletKind.Navigation, defaults: [
            { kind: OutletItemKind.Navigation, id: 'dashboard', title: 'Dashboard', target: { module: 'dashboard' } },
            { kind: OutletItemKind.Navigation, id: 'sales', title: 'Sales', target: { module: 'sales' } },
            { kind: OutletItemKind.Navigation, id: 'support', title: 'Support', target: { module: 'support' } },
        ] },
        { name: NavigationRegionKind.Sidebar, kind: OutletKind.Navigation, defaults: [{ kind: OutletItemKind.Navigation, id: 'dashboard', title: 'Dashboard', target: { module: 'dashboard', feature: 'overview' } }] },
    ] },
    modules: [
        { module: 'sales', refinements: [{ outlet: NavigationRegionKind.Sidebar, mode: OutletMode.Overrides, items: [
            { kind: OutletItemKind.Navigation, id: 'orders', title: 'Orders', target: { module: 'sales', feature: 'orders' }, children: [
                { kind: OutletItemKind.Navigation, id: 'returns', title: 'Returns', target: { module: 'sales', feature: 'orders.returns' } },
            ] },
            { kind: OutletItemKind.Navigation, id: 'customers', title: 'Customers', target: { module: 'sales', feature: 'customers' } },
        ] }] },
        { module: 'support', refinements: [
            { outlet: NavigationRegionKind.Topbar, mode: OutletMode.Extends, items: [{ kind: OutletItemKind.Navigation, id: 'help', title: 'Help center', target: { module: 'support', feature: 'kb' }, slot: 'side' }] },
            { outlet: NavigationRegionKind.Sidebar, mode: OutletMode.Overrides, items: [
                { kind: OutletItemKind.Navigation, id: 'tickets', title: 'Tickets', target: { module: 'support', feature: 'tickets' } },
                { kind: OutletItemKind.Navigation, id: 'kb', title: 'Knowledge base', target: { module: 'support', feature: 'kb' }, slot: 'side' },
            ] },
        ] },
    ],
};
