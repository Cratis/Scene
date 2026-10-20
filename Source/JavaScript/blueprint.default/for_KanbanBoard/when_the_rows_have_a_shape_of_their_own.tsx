// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { readCardFieldList, readCards } from '../foundation';
import { renderFoundation } from '../for_foundation/given';

// A query row is a read model (a product with productId, name, status), not a card: the board is told which properties say what a card is.
const columns = [{ id: 'draft', label: 'Draft' }, { id: 'approved', label: 'Approved' }];
const rows = [
    { productId: '6f1f', sku: 'ACM-1000', name: 'Acme mug', price: 59, status: 'draft' },
    { productId: '6f20', sku: 'ACM-1001', name: 'Desk lamp', price: 399, status: 'approved' },
    { productId: '6f21', sku: 'ACM-1002', status: 'approved' },
];
const mapping = { id: 'productId', title: 'name', column: 'status', fields: [{ field: 'sku', label: 'SKU' }, { field: 'price' }] };

describe('when the rows of a kanban board have a shape of their own', () => {
    afterEach(cleanup);

    it('should read the id, title and column from the named properties', () => {
        readCards(rows, mapping).map(card => [card.id, card.title, card.column]).should.deep.equal([['6f1f', 'Acme mug', 'draft'], ['6f20', 'Desk lamp', 'approved']]);
    });

    it('should show the named key fields under their labels, the property name when none is given', () => {
        readCards(rows, mapping)[0].fields.should.deep.equal([{ label: 'SKU', value: 'ACM-1000' }, { label: 'price', value: '59' }]);
    });

    it('should drop a row that has no title', () => readCards(rows, mapping).length.should.equal(2));
    it('should still total a numeric property of the row', () => readCards(rows, mapping)[1].numbers.price.should.equal(399));
    it('should read the card shape when nothing is named', () => readCards([{ id: 'c1', title: 'A', column: 'x' }]).map(card => card.id).should.deep.equal(['c1']));
    it('should keep each field once and drop an entry without a property', () => readCardFieldList([{ field: 'a' }, { field: 'a', label: 'Again' }, { label: 'none' }]).should.deep.equal([{ field: 'a' }]));

    it('should draw the cards in their columns', () => {
        const { container } = renderFoundation('kanbanBoard', { columns, cards: rows, cardId: 'productId', cardTitle: 'name', cardColumn: 'status', cardFields: [{ field: 'sku', label: 'SKU' }] });
        const columnsDrawn = Array.from(container.querySelectorAll('.foundation-board-column')).map(column => Array.from(column.querySelectorAll('.foundation-board-card strong')).map(title => title.textContent));
        columnsDrawn.should.deep.equal([['Acme mug'], ['Desk lamp']]);
        screen.getByText('ACM-1000');
    });
});
