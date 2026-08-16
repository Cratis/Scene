// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Button',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The button family. Note that `button` deliberately claims the same bare name `core` declares, so a profile listing core then PrimeReact resolves it here. `splitButton` is a Cratis-owned rebuild - PrimeReact 11 removed its own with no replacement - composed from the `Button` and `Popover` that survived, so it is themed and positioned by the same machinery as everything beside it.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('button', 'button', { label: 'Save', icon: 'pi pi-check' }),
            sceneComponent('splitButton', 'splitButton', { label: 'Save', items: ['Save as draft', { separator: true }, 'Discard'] }),
            sceneComponent('speedDial', 'speedDial', { items: [{ label: 'Add', icon: 'pi pi-plus' }, { label: 'Edit', icon: 'pi pi-pencil' }] }),
            sceneComponent('buttonGroup', 'buttonGroup', { buttons: ['Left', 'Middle', 'Right'] }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
