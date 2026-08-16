// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Misc',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The remaining components: indicators, badges, placeholders and a terminal. Two of them - `blockUI` and `scrollTop` - are Cratis-owned rebuilds, because PrimeReact 11 removed both with no replacement and no headless hook; they render here through the same registry as everything else, which is the point. `terminal` accepts input and answers nothing until the hosting application passes an `onCommand` callback - responding to a command is application behavior, not something a Scene element can express.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('avatar', 'avatar', { label: 'AL', shape: 'circle' }),
            sceneComponent('badge', 'badge', { value: '8', severity: 'danger' }),
            sceneComponent('chip', 'chip', { label: 'Engineering', icon: 'pi pi-users', removable: true }),
            sceneComponent('tag', 'tag', { value: 'Published', severity: 'success', rounded: true }),
            sceneComponent('progressBar', 'progressBar', { value: 65 }),
            sceneComponent('progressSpinner', 'progressSpinner', { size: 40 }),
            sceneComponent('skeleton', 'skeleton', { width: '12rem', height: '2rem' }),
            sceneComponent('scrollTop', 'scrollTop', { height: 140 }, { content: [sceneComponent('scrollTopText', 'text', { text: 'Scroll this box to reveal the button.' })] }),
            sceneComponent('blockUI', 'blockUI', { blocked: true }, { content: [sceneComponent('blockText', 'text', { text: 'Blocked content' })] }),
            sceneComponent('inplace', 'inplace', { label: 'Click to edit' }, { content: [sceneComponent('inplaceInput', 'inputText', { value: 'Editable' })] }),
            sceneComponent('terminal', 'terminal', { welcomeMessage: 'Scene preview terminal', prompt: 'scene $' }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
