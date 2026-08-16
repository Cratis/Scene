// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Overlay',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The overlay family. Each one renders its own trigger: an overlay is only interesting while it is open, and a Scene element has nowhere to record that a user closed it, so the adapter owns visibility and keeps a way back.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('dialog', 'dialog', { header: 'Edit project' }, { content: [sceneComponent('dialogText', 'text', { text: 'Dialog body' })] }),
            sceneComponent('confirmDialog', 'confirmDialog', { message: 'Delete this project?', triggerLabel: 'Delete' }),
            sceneComponent('overlayPanel', 'overlayPanel', { triggerLabel: 'Details' }, { content: [sceneComponent('overlayText', 'text', { text: 'Overlay body' })] }),
            sceneComponent('sidebar', 'sidebar', { position: 'right', triggerLabel: 'Open panel' }, { content: [sceneComponent('sidebarText', 'text', { text: 'Sidebar body' })] }),
            sceneComponent('tooltip', 'tooltip', { text: 'Explains the thing', label: 'Hover me' }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
