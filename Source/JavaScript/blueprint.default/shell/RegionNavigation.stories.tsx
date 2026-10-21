// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { ApplicationStructure, ExternalComponent, NavigationModel, NavigationRegionKind, NavigationRegionMode, SceneElement, Visibility } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { CoreOutlet, RegisteredComponentProps, SceneNavigationHost } from '@cratis/scene.react';
import { LayoutConfigProvider } from '../configuration';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const structure = {
    modules: [
        { id: 'dashboard', name: 'Dashboard', features: [{ id: 'overview', name: 'Overview', features: [], slices: [] }] },
        { id: 'sales', name: 'Sales', features: [{ id: 'orders', name: 'Orders', features: [{ id: 'returns', name: 'Returns', features: [], slices: [] }], slices: [] }, { id: 'customers', name: 'Customers', features: [], slices: [] }] },
        { id: 'support', name: 'Support', features: [{ id: 'tickets', name: 'Tickets', features: [], slices: [] }, { id: 'kb', name: 'Knowledge base', features: [], slices: [] }] },
    ],
} as unknown as ApplicationStructure;

const navigation: NavigationModel = {
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
            { id: 'orders', title: 'Orders', target: { module: 'sales', feature: 'orders' }, children: [{ id: 'returns', title: 'Returns', target: { module: 'sales', feature: 'orders.returns' } }] },
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

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, content: SceneElement[] = []) =>
    ({ id, componentName, properties, slots: content.length > 0 ? { content } : {}, visibility: Visibility.Visible }) as unknown as ExternalComponent;

function Page({ element: page, slots }: RegisteredComponentProps) {
    return <section style={{ padding: '1rem' }}><h2>{page.id}</h2>{slots.content}</section>;
}

const screens: Record<string, SceneElement> = {
    'dashboard.overview': element('dashboard.overview', 'story:page'),
    'sales.orders': element('sales.orders', 'story:page'),
    'sales.orders.returns': element('sales.orders.returns', 'story:page'),
    'sales.customers': element('sales.customers', 'story:page'),
    'support.tickets': element('support.tickets', 'story:page', {}, [element('side', 'core:outlet', { name: 'side' })]),
    'support.kb': element('support.kb', 'story:page'),
};

function Application({ initialScreen }: { initialScreen: string }) {
    return <LayoutConfigProvider>
        <SceneNavigationHost screens={screens} initialScreen={initialScreen} registry={{ 'story:page': Page, 'core:outlet': CoreOutlet }}
            navigationModel={{ structure: new ApplicationStructureIndex(structure), navigation }}
            frame={content => <div className='layout-wrapper layout-static'>
                <div className='layout-topbar'><Topbar element={element('topbar', 'topbar')} slots={{}} /></div>
                <div className='layout-sidebar'><Sidebar element={element('sidebar', 'sidebar')} slots={{}} /></div>
                <div className='layout-content-wrapper'>{content}</div>
            </div>} />
    </LayoutConfigProvider>;
}

/**
 * The topbar and sidebar of the shell showing the effective navigation of the module on the page: the application items, a
 * module's own, hierarchical sidebar items, and items that render into a second slot.
 */
const meta = {
    title: 'Blueprint/Navigation regions',
    component: Application,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Application>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A module whose sidebar replaces the application's and nests Returns under Orders. */
export const HierarchicalSidebar: Story = { args: { initialScreen: 'sales.orders' } };

/** Activating the Knowledge base item renders it into the side outlet while Tickets stays in the main one; both are active. */
export const TwoSlots: Story = {
    args: { initialScreen: 'support.tickets' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('link', { name: 'Knowledge base' }));
        await expect(canvasElement.querySelectorAll('.layout-region-sidebar [data-active="true"]').length).toBe(2);
    },
};
