// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readCardRows, readCards } from '../foundation/boardModel';

describe('when reading the original card rows', () => {
    it('should key the original rows by the mapped id without copying them', () => {
        const row = { productId: 42, name: 'Mug', secretToTheCard: 'retained' };
        const rows = readCardRows([row], { id: 'productId', title: 'name' });
        [...rows.keys()].should.deep.equal(['42']);
        rows.get('42')!.should.equal(row);
    });

    it('should keep the first row when mapped ids repeat', () => {
        const first = { productId: 42, name: 'First' };
        const rows = readCardRows([first, { productId: '42', name: 'Duplicate' }], { id: 'productId', title: 'name' });
        rows.size.should.equal(1);
        rows.get('42')!.should.equal(first);
    });

    it('should skip an untitled duplicate just as the drawn cards do', () => {
        const row = { id: 'a', title: 'T' };
        const supplied = [{ id: 'a' }, row];
        readCards(supplied).map(card => card.title).should.deep.equal(['T']);
        readCardRows(supplied).get('a')!.should.equal(row);
    });

    it('should skip a duplicate with an invalid mapped title just as the drawn cards do', () => {
        const row = { productId: 42, name: 'Mug' };
        const supplied = [{ productId: 42, name: null }, row];
        const mapping = { id: 'productId', title: 'name' };
        readCards(supplied, mapping).map(card => card.title).should.deep.equal(['Mug']);
        readCardRows(supplied, mapping).get('42')!.should.equal(row);
    });

    it('should ignore invalid rows and empty or missing ids', () => {
        [...readCardRows([null, [], 'not a row', {}, { id: '' }, { id: 7 }, { id: 'valid', title: 'Task' }]).keys()].should.deep.equal(['valid']);
        readCardRows(undefined).size.should.equal(0);
    });
});
