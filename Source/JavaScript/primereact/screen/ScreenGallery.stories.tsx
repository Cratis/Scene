// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Screen',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'Screenplay\'s screen vocabulary, plus `text` - the third name shared with `core`. A screen compiled from a .play file emits these directive kinds, so declaring them is what lets it render through this package with no translation step.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('text', 'text', { text: 'A run of prose that follows the theme.' }),
            sceneComponent('title', 'title', { text: 'Project overview', level: 2 }),
            sceneComponent('field', 'field', { label: 'Owner', value: 'Ada Lovelace' }),
            sceneComponent('section', 'section', { title: 'Contact' }, { content: [sceneComponent('sectionField', 'field', { label: 'Email', value: 'ada@example.com' })] }),
            sceneComponent('summary', 'summary', { title: 'At a glance', items: [{ label: 'Status', value: 'Active' }, { label: 'Owner', value: 'Ada' }] }),
            sceneComponent('action', 'action', { label: 'Archive project', intent: 'destructive' }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
