// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';

const meta = {
    title: 'PrimeReact/Data',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: 'The data family. `dataTable` is also registered under Screenplay\'s `table` name, and works out its columns from nested `column` children, a `columns` property, or the shape of the first row.' } },
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every component in this family, rendered through the real registry by the real renderer. */
export const Gallery: Story = {
    args: {
        element: sceneGallery('gallery', [
            sceneComponent(
                'table',
                'table',
                { rows: [{ name: 'Ada', role: 'Engineer' }, { name: 'Grace', role: 'Admiral' }] },
                {
                    columns: [
                        sceneComponent('c1', 'column', { field: 'name', header: 'Name', sortable: true }),
                        sceneComponent('c2', 'column', { field: 'role', header: 'Role' }),
                    ],
                }
            ),
            sceneComponent('dataTable', 'dataTable', { rows: [{ id: 1, title: 'Inferred columns' }] }),
            sceneComponent('dataView', 'dataView', { rows: [{ title: 'Kickoff', description: 'Agree the scope' }] }),
            sceneComponent('tree', 'tree', { nodes: [{ label: 'Documents', children: ['Work', 'Home'] }] }),
            sceneComponent('treeTable', 'treeTable', {
                columns: [{ field: 'name', header: 'Name' }],
                nodes: [{ label: 'Root', data: { name: 'Root' }, children: [{ label: 'Child', data: { name: 'Child' } }] }],
            }),
            sceneComponent('timeline', 'timeline', {
                events: [{ title: 'Ordered', description: 'Order placed', date: '09:00' }, { title: 'Shipped', description: 'Left the depot', date: '14:20' }],
            }),
            sceneComponent('paginator', 'paginator', { totalRecords: 120, pageSize: 10 }),
            sceneComponent('orderList', 'orderList', { header: 'Priority', items: ['First', 'Second', 'Third'] }),
            sceneComponent('pickList', 'pickList', { source: ['Alpha', 'Beta'], target: ['Gamma'] }),
            sceneComponent('organizationChart', 'organizationChart', { nodes: [{ label: 'CEO', children: ['CTO', 'CFO'] }] }),
            sceneComponent('virtualScroller', 'virtualScroller', { items: Array.from({ length: 200 }, (_, index) => `Row ${index + 1}`) }),
        ]),
        registry: primeReactComponents,
        resolveBinding: () => undefined,
    },
};
