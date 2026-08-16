// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Menu',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The menu family. All ten read the same nested item model, so one authored menu can be shown as a menubar, a tiered menu or a dock without being restructured.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('menu', 'menu', { items: ['New', 'Open', { separator: true }, 'Exit'] }),
            sceneComponent('menubar', 'menubar', { items: [{ label: 'File', items: ['New', 'Open'] }, { label: 'Edit', items: ['Undo'] }] }),
            sceneComponent('breadcrumb', 'breadcrumb', { items: ['Projects', 'Acme', 'Settings'] }),
            sceneComponent('tabMenu', 'tabMenu', { items: [{ label: 'Overview', icon: 'pi pi-home' }, { label: 'Activity', icon: 'pi pi-list' }] }),
            sceneComponent('steps', 'steps', { items: ['Account', 'Payment', 'Confirm'] }),
            sceneComponent('tieredMenu', 'tieredMenu', { items: [{ label: 'File', items: [{ label: 'Export', items: ['PDF', 'CSV'] }] }] }),
            sceneComponent('panelMenu', 'panelMenu', { items: [{ label: 'Reports', items: ['Monthly', 'Annual'] }] }),
            sceneComponent('contextMenu', 'contextMenu', { label: 'Right-click this text', items: ['Copy', 'Paste'] }),
            sceneComponent('megaMenu', 'megaMenu', {
                items: [{ label: 'Catalog', items: [[{ label: 'Hardware', items: ['Laptops', 'Phones'] }]] }],
            }),
            sceneComponent('dock', 'dock', { items: [{ label: 'Home', icon: 'pi pi-home' }, { label: 'Search', icon: 'pi pi-search' }] }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
