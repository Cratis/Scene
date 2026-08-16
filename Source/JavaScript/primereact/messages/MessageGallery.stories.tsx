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
        docs: { description: { component: 'The message family. `message` and `inlineMessage` share PrimeReact 11\'s singular `message` module but mean different things on a screen - one is about a region, the other about the field beside it - which v11 lets them say with `variant` as well as with width. The plural `messages` module was removed in v11; this package never declared a name for it. `toast` announces itself once on mount, grouped by the element\'s own id, because a Scene element has no other way to make an imperative call.' } },
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
