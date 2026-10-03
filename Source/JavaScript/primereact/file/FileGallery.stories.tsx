// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/File',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'File-upload controls through the Scene registry. A host supplies an upload handler or server URL when it wants files sent.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every file component in this package, rendered through the real Scene registry. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('fileUpload', 'fileUpload', { mode: 'advanced', accept: 'image/*', multiple: true }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
