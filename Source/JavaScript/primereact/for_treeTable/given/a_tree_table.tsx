// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { PrimeTreeTable } from '../../data/PrimeTreeTable';
import { sceneComponent } from '../../storyElements';

/** The documents tree most specifications use: Documents > Work > Plan, Documents > Photos, and Music. */
export const documents = [
    {
        key: 'documents', label: 'Documents', data: { name: 'Documents', kind: 'Folder' }, expanded: true, children: [
            { key: 'work', label: 'Work', data: { name: 'Work', kind: 'Folder' }, children: [{ key: 'plan', label: 'Plan', data: { name: 'Plan', kind: 'File' } }] },
            { key: 'photos', label: 'Photos', data: { name: 'Photos', kind: 'Folder' } },
        ],
    },
    { key: 'music', label: 'Music', data: { name: 'Music', kind: 'Folder' } },
];

export const columns = [{ field: 'name', header: 'Name' }, { field: 'kind', header: 'Kind' }];

export const treeTable = (properties: Record<string, unknown>, isEnabled = true) => (
    <PrimeTreeTable element={{ ...sceneComponent('tree', 'treeTable', properties), isEnabled }} slots={{}} />
);

export const renderTreeTable = (properties: Record<string, unknown>, isEnabled = true) => render(treeTable(properties, isEnabled));

/** The text of every row, in order. */
export const rowTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr')).map(row => row.textContent);
