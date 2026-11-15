// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataPack } from '@cratis/scene.model';
import { sampleSetsOfCollections, withCollectionSets } from '../previewReadModelRows';

const basket = {
    type: 'object',
    properties: {
        basketId: { type: 'string', format: 'uuid' },
        lines: { type: 'array', items: { type: 'object', properties: { sku: { type: 'string' }, quantity: { type: 'integer' }, unitPrice: { type: 'number' } } } },
    },
};
const flat = { type: 'object', properties: { lineCount: { type: 'integer' } } };
const referenced = { type: 'object', properties: { lines: { type: 'array', items: { $ref: '#/definitions/Line' } } }, definitions: { Line: { type: 'object', properties: { sku: { type: 'string' } } } } };

describe('when completing the sample data with the collections of the read models', () => {
    const sets = sampleSetsOfCollections([{ name: 'BasketContents', schema: basket }, { name: 'BasketSize', schema: flat }, { name: 'Referenced', schema: referenced }, { name: 'Nothing', schema: undefined }]);
    const basketSet = sets.find(set => set.shape === 'BasketContents')!;
    const lines = basketSet.rows[0].lines as Record<string, unknown>[];

    it('should make a set for each read model that holds a collection of records', () => sets.map(set => set.shape).should.deep.equal(['BasketContents', 'Referenced']));
    it('should leave a read model without a collection to its own rows', () => sets.some(set => set.shape === 'BasketSize').should.be.false);
    it('should give each row its records', () => basketSet.rows.every(row => (row.lines as unknown[]).length === 3).should.be.true);
    it('should make the fields of a record from its schema', () => Object.keys(lines[0]).should.deep.equal(['sku', 'quantity', 'unitPrice']));
    it('should give a quantity a count', () => lines.map(line => line.quantity).should.deep.equal([1, 2, 3]));
    it('should give a price an amount', () => lines.map(line => line.unitPrice).should.deep.equal([49, 89, 349]));
    it('should give a sku a code', () => (lines[0].sku as string).should.equal('ACM-1000'));
    it('should give an identifier a unique id', () => (basketSet.rows[0].basketId as string).should.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/));
    it('should follow a reference to a definition of the schema', () => ((sets[1].rows[0].lines as Record<string, unknown>[])[0].sku as string).should.equal('ACM-1000'));
    it('should make the same rows every time', () => sampleSetsOfCollections([{ name: 'BasketContents', schema: basket }])[0].should.deep.equal(basketSet));
});

describe('when adding the sets to the pack in effect', () => {
    const own = { id: 'storefront', title: 'Storefront', locale: 'en', owner: '', sets: [{ shape: 'BasketContents', rows: [{ own: true }] }, { shape: 'ListedProduct', rows: [] }] } as SampleDataPack;
    const other = { id: 'other', title: 'Other', locale: 'en', owner: '', sets: [] } as SampleDataPack;
    const sets = [{ shape: 'BasketContents', rows: [{ generated: true }] }, { shape: 'Orders', rows: [{ generated: true }] }];
    const packs = [own, other];
    const result = withCollectionSets(packs, 'storefront', sets);

    it('should add the sets the pack does not hold', () => result[0].sets.map(set => set.shape).should.deep.equal(['BasketContents', 'ListedProduct', 'Orders']));
    it('should keep the rows the author wrote for a read model', () => result[0].sets[0].rows.should.deep.equal([{ own: true }]));
    it('should leave the other packs as they were', () => (result[1] === other).should.be.true);
    it('should leave the pack it was given as it was', () => own.sets.length.should.equal(2));
    it('should add nothing when no pack is in effect', () => (withCollectionSets(packs, '', sets) === packs).should.be.true);
    it('should add nothing when the pack in effect is not there', () => (withCollectionSets(packs, 'gone', sets) === packs).should.be.true);
    it('should add nothing when the pack holds everything', () => (withCollectionSets(packs, 'storefront', [sets[0]]) === packs).should.be.true);
});
