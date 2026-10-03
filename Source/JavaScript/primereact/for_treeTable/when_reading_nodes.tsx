// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { PrimeTreeTable } from '../data/PrimeTreeTable';
import { sceneComponent } from '../storyElements';
import { columns, documents, renderTreeTable, rowTexts } from './given/a_tree_table';

describe('when reading nodes', () => {
    it('should show the root rows and the children of nodes authored as expanded, in the authored columns', () => {
        const { container } = renderTreeTable({ items: documents, columns });
        screen.getAllByRole('columnheader').map(header => header.textContent).should.deep.equal(['Name', 'Kind']);
        rowTexts(container).should.deep.equal(['CollapseDocumentsFolder', 'ExpandWorkFolder', 'PhotosFolder', 'MusicFolder']);
    });

    it('should show object cell values readably, never as [object Object]', () => {
        const { container } = renderTreeTable({
            columns: [{ field: 'owner', header: 'Owner' }, { field: 'tags', header: 'Tags' }, { field: 'size', header: 'Size' }],
            items: [{ key: 'a', data: { owner: { name: 'Ada', team: { id: 7 } }, tags: ['x', { y: 1 }], size: 12 } }],
        });
        rowTexts(container).should.deep.equal(['name: Ada; team: id: 7x, y: 112']);
        container.textContent!.should.not.contain('[object');
    });

    it('should read numbers and booleans as leaf nodes, with their text in the first column', () => {
        const { container } = renderTreeTable({ items: ['One', 2, true] });
        rowTexts(container).should.deep.equal(['One', '2', 'true']);
    });

    it('should show a scalar data value in the first column', () => {
        const { container } = renderTreeTable({ items: [{ key: 'a', data: 42 }] });
        rowTexts(container).should.deep.equal(['42']);
    });

    it('should say how many entries could not be read as a node, instead of showing less without a word', () => {
        renderTreeTable({ items: ['Kept', null, ['nested'], { key: 'p', children: [null] }] });
        screen.getByText('3 entries of items could not be read as a node and were skipped.');
    });

    it('should refuse serialized legacy UI elements in items and columns visibly, and not render their fields', () => {
        const { container } = renderTreeTable({
            items: ['Kept', { _derivedTypeId: 'PrimeReact.Button', id: 'b', text: 'Click' }],
            columns: [{ _derivedTypeId: 'PrimeReact.Column', id: 'c', header: 'Legacy' }],
        });
        const alerts = screen.getAllByRole('alert').map(alert => alert.textContent);
        alerts.should.have.lengthOf(2);
        alerts[0]!.should.contain("1 entry of items is a serialized legacy UI element");
        alerts[1]!.should.contain("1 entry of columns is a serialized legacy UI element");
        rowTexts(container).should.deep.equal(['Kept']);
        container.textContent!.should.not.contain('Click');
        container.textContent!.should.not.contain('_derivedTypeId');
    });

    it('should render the empty collections the production prototypes carry as a readable empty table', () => {
        const { container } = renderTreeTable({ columns: [], items: [], selectionMode: 0, selection: null, paginator: false, rows: 10 });
        rowTexts(container).should.deep.equal(['No records found']);
        screen.getAllByRole('columnheader').map(header => header.textContent).should.deep.equal(['Label']);
        (screen.queryByRole('alert') === null).should.equal(true);
    });

    it('should use the label of the empty state the author gave', () => {
        const { container } = renderTreeTable({ items: [], emptyLabel: 'Nothing here' });
        rowTexts(container).should.deep.equal(['Nothing here']);
    });

    describe('and the columns come from the same helper the data table uses', () => {
        it('should take column names given as strings', () => {
            renderTreeTable({ columns: ['name', 'kind'], items: documents });
            screen.getAllByRole('columnheader').map(header => header.textContent).should.deep.equal(['name', 'kind']);
        });

        it('should take nested column elements before a columns property', () => {
            const element = sceneComponent('tree', 'treeTable', { columns, items: documents }, { columns: [sceneComponent('c', 'column', { field: 'kind', header: 'Type' })] });
            render(<PrimeTreeTable element={element} slots={{}} />);
            screen.getAllByRole('columnheader').map(header => header.textContent).should.deep.equal(['Type']);
        });

        it('should infer the columns from the first row of data when none were authored', () => {
            renderTreeTable({ items: documents });
            screen.getAllByRole('columnheader').map(header => header.textContent).should.deep.equal(['name', 'kind']);
        });
    });

    it('should leave the authored data untouched', () => {
        const items = JSON.parse(JSON.stringify(documents));
        const properties = { items, columns, selection: ['plan'] };
        const before = JSON.stringify(properties);
        renderTreeTable(properties);
        JSON.stringify(properties).should.equal(before);
    });
});
