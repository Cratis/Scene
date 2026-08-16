// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Media',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The media family. `galleria` and `carousel` both ship without a default template, so each adapter supplies one built from the fields the element names.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('image', 'image', { src: 'https://primefaces.org/cdn/primereact/images/galleria/galleria1.jpg', alt: 'A landscape', width: '200', preview: true }),
            sceneComponent('galleria', 'galleria', {
                maxWidth: 320,
                items: [
                    { src: 'https://primefaces.org/cdn/primereact/images/galleria/galleria1.jpg', alt: 'One' },
                    { src: 'https://primefaces.org/cdn/primereact/images/galleria/galleria2.jpg', alt: 'Two' },
                ],
            }),
            sceneComponent('carousel', 'carousel', {
                numVisible: 2,
                items: [
                    { title: 'Alpha', description: 'First item' },
                    { title: 'Beta', description: 'Second item' },
                    { title: 'Gamma', description: 'Third item' },
                ],
            }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
