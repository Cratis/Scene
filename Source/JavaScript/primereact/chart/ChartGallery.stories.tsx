// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';

const meta = {
    title: 'PrimeReact/Chart',
    component: SceneElementView,
    tags: ['autodocs'],
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A Chart.js chart rendered through the Scene element and package registry. */
const salesData = {
    labels: ['January', 'February', 'March'],
    datasets: [{ label: 'Sales', data: [12, 19, 8], backgroundColor: '#6366f1' }],
};

export const Bar: Story = {
    args: {
        element: sceneComponent('sales', 'chart', {
            type: 'bar', data: salesData, options: { maintainAspectRatio: false }, style: { height: 240 }, ariaLabel: 'Monthly sales',
        }),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};

/** A migrated chart that has no data yet. It says so instead of drawing a blank canvas or inventing values. */
export const MigratedWithoutData: Story = {
    args: {
        element: sceneComponent('legacy-empty', 'chart', { type: 0, style: { height: 72 }, ariaLabel: 'Migrated chart without data', legacyType: 'PrimeReact.Chart' }),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};

/** A chart type the renderer does not know is reported rather than drawn as a bar chart. */
export const UnsupportedType: Story = {
    args: {
        element: sceneComponent('unsupported', 'chart', { type: 8, data: salesData }),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};

/** A migrated element that retains the original numeric ChartType enum value in its own properties. */
export const MigratedLegacyBar: Story = {
    args: {
        element: sceneComponent('legacy-sales', 'chart', {
            type: 0, data: salesData, options: { maintainAspectRatio: false }, style: { height: 240 }, ariaLabel: 'Migrated monthly sales',
            legacyType: 'PrimeReact.Chart', legacyExtras: { canvas: { x: 256, y: 184 } },
        }),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
