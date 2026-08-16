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
        docs: {
            description: {
                component:
                    'The menu family. All ten read the same nested item model, so one authored menu can be shown as a menubar, a tiered menu or a dock without being restructured. Only `menu`, `breadcrumb` and `contextMenu` are still PrimeReact underneath - PrimeReact 11 removed the other seven, and this gallery is where the Cratis-owned replacements are checked to still look and behave like the family they belong to.',
            },
        },
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
            sceneComponent('steps', 'steps', { items: ['Account', 'Payment', 'Confirm'], activeIndex: 1 }),
            sceneComponent('tieredMenu', 'tieredMenu', { items: [{ label: 'File', items: [{ label: 'Export', items: ['PDF', 'CSV'] }] }] }),
            sceneComponent('panelMenu', 'panelMenu', { items: [{ label: 'Reports', items: ['Monthly', 'Annual'] }] }),
            sceneComponent('contextMenu', 'contextMenu', { label: 'Right-click this text', items: ['Copy', 'Paste'] }),
            sceneComponent('megaMenu', 'megaMenu', {
                items: [{ label: 'Catalog', items: [{ label: 'Hardware', items: ['Laptops', 'Phones'] }, { label: 'Software', items: ['Licenses'] }] }],
            }),
            sceneComponent('dock', 'dock', { items: [{ label: 'Home', icon: 'pi pi-home' }, { label: 'Search', icon: 'pi pi-search' }] }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};

/**
 * Every component in this family with nothing authored, which is what a screen under construction looks
 * like. Each one has to come out as an empty container rather than take the gallery down with it.
 */
export const Unconfigured: Story = {
    args: {
        element: sceneGallery('unconfigured', [
            sceneComponent('menu', 'menu'),
            sceneComponent('menubar', 'menubar'),
            sceneComponent('breadcrumb', 'breadcrumb'),
            sceneComponent('tabMenu', 'tabMenu'),
            sceneComponent('steps', 'steps'),
            sceneComponent('tieredMenu', 'tieredMenu'),
            sceneComponent('panelMenu', 'panelMenu'),
            sceneComponent('contextMenu', 'contextMenu'),
            sceneComponent('megaMenu', 'megaMenu'),
            sceneComponent('dock', 'dock'),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
