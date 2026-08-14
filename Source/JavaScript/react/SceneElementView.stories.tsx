// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { Control, ExternalComponent, HorizontalAlignment, Panel, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { SceneElementView } from './SceneElementView';
import { coreComponents } from './core';

function control(id: string): Control {
    return {
        id,
        name: id,
        properties: {},
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 },
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        tabIndex: 0,
    };
}

function coreComponent(id: string, componentName: string, properties: Record<string, unknown> = {}): ExternalComponent {
    return { ...control(id), properties, componentName, slots: {} };
}

const card: ExternalComponent = {
    ...control('welcome-card'),
    componentName: 'core:card',
    slots: { content: [coreComponent('welcome-text', 'core:text', { text: 'Welcome to Scene' })] },
};

const root: Panel = { ...control('root'), children: [card] };

const meta = {
    title: 'Scene/SceneElementView',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CoreCardWithText: Story = {
    args: {
        element: root,
        registry: coreComponents,
        resolveBinding: () => undefined,
    },
};

export const UnresolvedComponent: Story = {
    args: {
        element: coreComponent('missing', 'vendor:fancy-widget'),
        registry: coreComponents,
        resolveBinding: () => undefined,
    },
};
