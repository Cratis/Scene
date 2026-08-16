// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Messages',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The message family. `message` and `inlineMessage` share PrimeReact\'s Message component but mean different things on a screen - one is about a region, the other about the field beside it - and the width is the difference a reader sees.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('message', 'message', { severity: 'info', text: 'Changes are saved automatically.' }),
            sceneComponent('inlineMessage', 'inlineMessage', { severity: 'error', text: 'Required' }),
            sceneComponent('toast', 'toast', { severity: 'success', summary: 'Saved', detail: 'The project was updated.' }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
