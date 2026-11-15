// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeMappingRows, mapShape, shapesOfActivePack } from '../sampleDataMappings';
import { sampleDataPackId } from '../sampleDataPackId';

const packs = [
    { id: 'a', title: 'A', locale: 'en-GB', owner: 'user', sets: [{ shape: 'Customer', rows: [] }, { shape: 'Order', rows: [] }, { shape: 'Customer', rows: [] }] },
    { id: 'b', title: 'B', locale: 'en-GB', owner: 'user', sets: [{ shape: 'Ticket', rows: [] }] },
];

describe('when listing the shapes of the active pack', () => {
    it('should list each shape once, in order', () => shapesOfActivePack(packs, 'a').should.deep.equal(['Customer', 'Order']));
    it('should list none for the generated data', () => shapesOfActivePack(packs, '').should.deep.equal([]));
    it('should list none for a pack nothing provides', () => shapesOfActivePack(packs, 'gone').should.deep.equal([]));
});

describe('when describing the mapping table', () => {
    const rows = describeMappingRows(['Customer', 'Order'], ['Customer', 'Accounts'], [{ shape: 'Order', readModel: 'Accounts' }]);

    it('should say a shape that is already a read model needs no mapping', () => rows[0].should.deep.equal({ shape: 'Customer', readModel: '', matchesByName: true }));
    it('should show the read model a shape is mapped to', () => rows[1].should.deep.equal({ shape: 'Order', readModel: 'Accounts', matchesByName: false }));
});

describe('when mapping a shape', () => {
    it('should add the mapping', () => mapShape([], 'Order', 'Accounts').should.deep.equal([{ shape: 'Order', readModel: 'Accounts' }]));
    it('should replace the shape\'s old mapping rather than repeat it', () => mapShape([{ shape: 'Order', readModel: 'Old' }, { shape: 'Other', readModel: 'X' }], 'Order', 'New').should.deep.equal([{ shape: 'Other', readModel: 'X' }, { shape: 'Order', readModel: 'New' }]));
    it('should remove the mapping when no read model is chosen', () => mapShape([{ shape: 'Order', readModel: 'Old' }], 'Order', '').should.deep.equal([]));
});

describe('when making an identifier for a new pack', () => {
    it('should make lower-case words joined by dashes', () => sampleDataPackId('Acme demo orders', []).should.equal('acme-demo-orders'));
    it('should drop accents and punctuation', () => sampleDataPackId('  Tromsø & Ålesund! ', []).should.equal('troms-alesund'));
    it('should fall back when the title yields nothing', () => sampleDataPackId('!!!', []).should.equal('data-set'));
    it('should number a taken identifier', () => sampleDataPackId('Acme', ['acme', 'acme-2']).should.equal('acme-3'));
});
