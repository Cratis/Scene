// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';

describe('when selecting a numeric legacy checkbox row', () => {
    it('should render its columns and update only runtime selection state', () => {
        const element = sceneComponent('tree-table', 'treeTable', {
            columns: [{ field: 'name', header: 'Name' }, { field: 'kind', header: 'Kind' }],
            items: [{ key: 'documents', label: 'Documents', data: { name: 'Documents', kind: 'Folder' } }],
            selectionMode: 3,
            selection: [],
            paginator: true,
            rows: 1,
        });
        render(<SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} />);

        (screen.getByRole('columnheader', { name: 'Name' }) !== undefined).should.equal(true);
        (screen.getByRole('columnheader', { name: 'Kind' }) !== undefined).should.equal(true);
        const checkbox = screen.getByRole('checkbox', { name: 'Select Documents' });
        fireEvent.click(checkbox);

        (checkbox as HTMLInputElement).checked.should.equal(true);
        JSON.stringify(element.properties.selection).should.equal('[]');
    });
});
