// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { columns, documents, rowTexts, treeTable } from './given/a_tree_table';

const selectedRows = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr[aria-selected="true"]')).map(row => row.textContent);

describe('when properties change', () => {
    it('should follow a new selection', () => {
        const { container, rerender } = render(treeTable({ items: documents, columns, selectionMode: 'single', selection: ['music'] }));
        selectedRows(container).should.deep.equal(['MusicFolder']);
        rerender(treeTable({ items: documents, columns, selectionMode: 'single', selection: ['photos'] }));
        selectedRows(container).should.deep.equal(['PhotosFolder']);
    });

    it('should follow a node becoming expanded in the document', () => {
        const collapsed = documents.map(node => ({ ...node, expanded: false }));
        const { container, rerender } = render(treeTable({ items: collapsed, columns }));
        rowTexts(container).should.have.lengthOf(2);
        rerender(treeTable({ items: documents, columns }));
        rowTexts(container).should.have.lengthOf(4);
    });

    it('should leave what the user did alone when an unrelated property changes or the data is an equal clone', () => {
        const { container, rerender } = render(treeTable({ items: documents, columns, selectionMode: 'multiple', selection: ['music'], ariaLabel: 'One' }));
        fireEvent.click(screen.getByRole('button', { name: 'Expand Work' }));
        fireEvent.click(container.querySelectorAll('tbody tr')[2]);

        rerender(treeTable({ items: JSON.parse(JSON.stringify(documents)), columns: [...columns], selectionMode: 'multiple', selection: ['music'], ariaLabel: 'Two' }));

        rowTexts(container).should.have.lengthOf(5);
        selectedRows(container).should.have.members(['MusicFolder', 'PlanFile']);
        screen.getByRole('treegrid', { name: 'Two' });
    });

    it('should keep a selection tied to the node, not to its position, when the order changes', () => {
        const { container, rerender } = render(treeTable({ items: documents, columns, selectionMode: 'single', selection: ['music'] }));
        rerender(treeTable({ items: [...documents].reverse(), columns, selectionMode: 'single', selection: ['music'] }));
        selectedRows(container).should.deep.equal(['MusicFolder']);
    });
});
