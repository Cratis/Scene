// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readCardRows } from '../foundation/boardModel';

describe('when reading the original card rows', () => {
    it('should key the original rows by the mapped id without copying them', () => {
        const row = { productId: 42, name: 'Mug', secretToTheCard: 'retained' };
        const rows = readCardRows([row], { id: 'productId' });
        [...rows.keys()].should.deep.equal(['42']);
        rows.get('42')!.should.equal(row);
    });

    it('should keep the first row when mapped ids repeat', () => {
        const first = { productId: 42, name: 'First' };
        const rows = readCardRows([first, { productId: '42', name: 'Duplicate' }], { id: 'productId' });
        rows.size.should.equal(1);
        rows.get('42')!.should.equal(first);
    });

    it('should ignore invalid rows and empty or missing ids', () => {
        [...readCardRows([null, [], 'not a row', {}, { id: '' }, { id: 7 }, { id: 'valid', title: 'Task' }]).keys()].should.deep.equal(['valid']);
        readCardRows(undefined).size.should.equal(0);
    });
});
