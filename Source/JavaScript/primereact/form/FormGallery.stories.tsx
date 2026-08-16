// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Form',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'Every form component the PrimeReact package declares. Each one holds its own value locally, because a Scene element carries authored configuration and has nowhere to record what a user has typed - so a preview is genuinely usable rather than frozen.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent('inputText', 'inputText', { placeholder: 'Name' }),
            sceneComponent('inputTextarea', 'inputTextarea', { placeholder: 'Notes', rows: 3 }),
            sceneComponent('inputNumber', 'inputNumber', { value: 42, showButtons: true }),
            sceneComponent('password', 'password', { placeholder: 'Password' }),
            sceneComponent('inputMask', 'inputMask', { mask: '99-999999' }),
            sceneComponent('floatLabel', 'floatLabel', { label: 'Project name' }),
            sceneComponent('iconField', 'iconField', { icon: 'pi pi-search', placeholder: 'Search' }),
            sceneComponent('dropdown', 'dropdown', { options: ['Draft', 'In review', 'Published'], placeholder: 'Status' }),
            sceneComponent('multiSelect', 'multiSelect', { options: ['Design', 'Engineering', 'Support'], display: 'chip' }),
            sceneComponent('listBox', 'listBox', { options: ['Daily', 'Weekly', 'Monthly'] }),
            sceneComponent('selectButton', 'selectButton', { options: ['Day', 'Week', 'Month'], value: 'Week' }),
            sceneComponent('checkbox', 'checkbox', { label: 'Notify me', checked: true }),
            sceneComponent('radioButton', 'radioButton', { options: ['Email', 'SMS'], value: 'Email' }),
            sceneComponent('toggleSwitch', 'toggleSwitch', { label: 'Enabled', checked: true }),
            sceneComponent('slider', 'slider', { value: 35 }),
            sceneComponent('rating', 'rating', { value: 4 }),
            sceneComponent('knob', 'knob', { value: 60 }),
            sceneComponent('calendar', 'calendar', { value: '2026-08-16' }),
            sceneComponent('colorPicker', 'colorPicker', { value: '#6366f1' }),
            sceneComponent('chips', 'chips', { value: ['alpha', 'beta'] }),
            sceneComponent('autoComplete', 'autoComplete', { options: ['Amsterdam', 'Athens', 'Auckland'], dropdown: true }),
            sceneComponent('treeSelect', 'treeSelect', {
                options: [{ label: 'Documents', children: ['Work', 'Home'] }],
            }),
            sceneComponent('cascadeSelect', 'cascadeSelect', {
                options: [{ label: 'Europe', items: [{ label: 'Norway' }, { label: 'Sweden' }] }],
            }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
