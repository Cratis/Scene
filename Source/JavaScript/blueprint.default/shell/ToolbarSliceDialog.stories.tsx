// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { ApplicationStructure, ExternalComponent, SceneElement } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { SceneNavigationHost, SliceCommandFieldsProvider, SliceInvokerProvider, coreComponents, createDryRunInvoker } from '@cratis/scene.react';

const structure = {
    modules: [{ id: 'sales', name: 'Sales', features: [{ id: 'orders', name: 'Orders', features: [], slices: [{ id: 'PlaceOrder', name: 'Place order', kind: 'StateChange', command: 'PlaceOrder' }] }] }],
} as unknown as ApplicationStructure;

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

const toolbar = element('toolbar', 'core:toolbar', { name: 'orders' }, { items: [
    element('new', 'core:toolbarItem', { name: 'new', kind: 'Action', label: 'New order', slice: 'sales.orders.PlaceOrder', emphasis: 'primary' }),
    element('cancel', 'core:toolbarItem', { name: 'cancel', kind: 'Action', label: 'Cancel order', slice: 'sales.orders.PlaceOrder', emphasis: 'secondary' }),
    element('more', 'core:toolbarItem', { name: 'more', kind: 'Action', label: 'More', emphasis: 'quiet' }),
] });

function OrdersToolbar({ warnEmptySlices }: { warnEmptySlices: boolean }) {
    return <SliceInvokerProvider invoker={createDryRunInvoker({ onInvoked: invocation => console.info('Dry run', invocation) })} warnEmptySlices={warnEmptySlices}>
        <SliceCommandFieldsProvider fieldsFor={() => [{ name: 'customer', type: 'string', required: true }, { name: 'product', type: 'string' }, { name: 'quantity', type: 'number' }]}>
            <SceneNavigationHost screens={{ Orders: toolbar }} initialScreen='Orders' registry={coreComponents}
                navigationModel={{ structure: new ApplicationStructureIndex(structure), navigation: { application: { regions: [] }, modules: [] } }} />
        </SliceCommandFieldsProvider>
    </SliceInvokerProvider>;
}

/**
 * Toolbar buttons that start State Change slices: emphasis maps to primary, secondary and quiet buttons, and a button opens its
 * slice as a task dialog whose form comes from the command and whose submit goes through the invoker in scope - here a dry run.
 */
const meta = {
    title: 'Blueprint/Toolbar slice dialogs',
    component: OrdersToolbar,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof OrdersToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A running application: no warning badge, the dialog opens from the button. */
export const Running: Story = {
    args: { warnEmptySlices: false },
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'New order' }));
        await expect(await within(document.body).findByRole('dialog', { name: 'New order' })).toBeTruthy();
    },
};

/** A design or preview host flags the button that has no slice yet. */
export const Designing: Story = { args: { warnEmptySlices: true } };
