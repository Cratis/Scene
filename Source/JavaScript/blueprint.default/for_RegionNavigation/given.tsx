// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { ApplicationStructure, ExternalComponent, NavigationModel, NavigationRegionKind, OutletItemKind, OutletKind, OutletMode, SceneElement } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { CoreSlot, RegisteredComponentProps, SceneNavigationHost } from '@cratis/scene.react';
import { LayoutConfigProvider } from '../configuration';
import { Sidebar, Topbar } from '../shell';

const structure = {
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

const navigation: NavigationModel = {
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
            { kind: OutletItemKind.Navigation, id: 'orders', title: 'Orders', target: { module: 'sales', feature: 'orders' }, children: [{ kind: OutletItemKind.Navigation, id: 'returns', title: 'Returns', target: { module: 'sales', feature: 'orders.returns' } }] },
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

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, content: SceneElement[] = []) =>
    ({ id, componentName, properties, slots: content.length > 0 ? { content } : {} }) as unknown as ExternalComponent;

function Page({ element: page, slots }: RegisteredComponentProps) {
    return <section data-screen={page.id}>{page.id}{slots.content}</section>;
}

const registry = { 'test:page': Page, 'core:slot': CoreSlot };

function screens(): Record<string, SceneElement> {
    const result: Record<string, SceneElement> = {};
    for (const module of structure.modules) {
        for (const feature of module.features) {
            const id = `${module.id}.${feature.id}`;
            result[id] = element(id, 'test:page', {}, id === 'support.tickets' ? [element('side', 'core:slot', { name: 'side' })] : []);
            for (const child of feature.features ?? []) result[`${id}.${child.id}`] = element(`${id}.${child.id}`, 'test:page');
        }
    }

    return result;
}

const shellElement = (id: string, properties: Record<string, unknown> = {}) => element(id, 'blueprint.default:topbar', properties);

/** The shell the application runs in: the default blueprint's topbar and sidebar showing the regions of the navigation model. */
export function renderShell(initialScreen: string, shell: ReactNode = undefined): ReactNode {
    return <>
        <LayoutConfigProvider>
            <SceneNavigationHost
                screens={screens()}
                initialScreen={initialScreen}
                registry={registry}
                navigationModel={{ structure: new ApplicationStructureIndex(structure), navigation }}
                frame={content => <>
                    <header><Topbar element={shellElement('topbar')} slots={{}} /></header>
                    <aside><Sidebar element={shellElement('sidebar')} slots={{}} /></aside>
                    <main>{content}</main>
                    {shell}
                </>} />
        </LayoutConfigProvider>
    </>;
}
