// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Panel',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The panel family. `accordion`, `tabView`, `splitter` and `stepper` pair a headers property with the content slot by position, because PrimeReact identifies their sections by React element type and a Scene adapter wrapping one would not be recognized.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('card', 'card', { title: 'Project', subtitle: 'Acme' }, { content: [sceneComponent('cardText', 'text', { text: 'Card body' })] }),
            sceneComponent('panel', 'panel', { header: 'Details', toggleable: true }, { content: [sceneComponent('panelText', 'text', { text: 'Panel body' })] }),
            sceneComponent('fieldset', 'fieldset', { legend: 'Address' }, { content: [sceneComponent('fieldsetText', 'text', { text: 'Fieldset body' })] }),
            sceneComponent('divider', 'divider', { label: 'or' }),
            sceneComponent('scrollPanel', 'scrollPanel', { height: 120 }, { content: [sceneComponent('scrollText', 'text', { text: 'Scrollable content' })] }),
            sceneComponent(
                'toolbar',
                'toolbar',
                {},
                { start: [sceneComponent('toolbarNew', 'button', { label: 'New' })], end: [sceneComponent('toolbarHelp', 'button', { label: 'Help', outlined: true })] }
            ),
            sceneComponent(
                'accordion',
                'accordion',
                { headers: ['Overview', 'History'] },
                { content: [sceneComponent('accOne', 'text', { text: 'Overview body' }), sceneComponent('accTwo', 'text', { text: 'History body' })] }
            ),
            sceneComponent(
                'tabView',
                'tabView',
                { headers: ['Summary', 'Activity'] },
                { content: [sceneComponent('tabOne', 'text', { text: 'Summary body' }), sceneComponent('tabTwo', 'text', { text: 'Activity body' })] }
            ),
            sceneComponent(
                'splitter',
                'splitter',
                { height: 140 },
                { content: [sceneComponent('splitOne', 'text', { text: 'Left' }), sceneComponent('splitTwo', 'text', { text: 'Right' })] }
            ),
            sceneComponent(
                'stepper',
                'stepper',
                { headers: ['Account', 'Payment'] },
                { content: [sceneComponent('stepOne', 'text', { text: 'Account details' }), sceneComponent('stepTwo', 'text', { text: 'Payment details' })] }
            ),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
