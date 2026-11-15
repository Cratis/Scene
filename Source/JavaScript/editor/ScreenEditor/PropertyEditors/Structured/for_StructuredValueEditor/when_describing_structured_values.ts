// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { validateValue } from '@cratis/scene.engine';
import { isStructured, movedItem, numberListEditorKind, stringListEditorKind, withField, withIdentities } from '../structuredValue';

const field = (path: string, valueType: PropertyValueType, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({ path, label: path, group: 'Content', valueType, ...extra });
const datasets = field('datasets', PropertyValueType.Collection, { item: { properties: [field('label', PropertyValueType.String), field('data', PropertyValueType.Json, { editorKind: numberListEditorKind })], open: true } });
const chart = field('data', PropertyValueType.Object, { properties: [field('labels', PropertyValueType.Json, { editorKind: stringListEditorKind }), datasets], open: true });

describe('when deciding what the structured editor can draw', () => {
    it('should draw an object that describes its fields', () => isStructured(chart).should.be.true);
    it('should draw a collection that describes its items', () => isStructured(datasets).should.be.true);
    it('should draw a list of words and a list of numbers', () => [isStructured(chart.properties![0]), isStructured(datasets.item!.properties[1])].should.deep.equal([true, true]));
    it('should not draw an object that describes nothing', () => isStructured(field('x', PropertyValueType.Object, { editorKind: 'size' })).should.be.false);
    it('should not draw any JSON', () => isStructured(field('x', PropertyValueType.Json)).should.be.false);
});

describe('when setting a field of a record', () => {
    it('should keep the other fields', () => withField({ a: 1, b: 2 }, 'a', 3)!.should.deep.equal({ a: 3, b: 2 }));
    it('should start a record when there is none', () => withField(undefined, 'a', 1)!.should.deep.equal({ a: 1 }));
    it('should remove a field set to nothing', () => withField({ a: 1, b: 2 }, 'a', undefined)!.should.deep.equal({ b: 2 }));
    it('should leave nothing at all when the last field goes', () => (withField({ a: 1 }, 'a', undefined) === undefined).should.be.true);
    it('should not change the record it was given', () => { const given = { a: 1 }; withField(given, 'a', 2); given.should.deep.equal({ a: 1 }); });
});

describe('when moving an item', () => {
    it('should swap it with its neighbour', () => movedItem([1, 2, 3], 2, -1).should.deep.equal([1, 3, 2]));
    it('should stay put at either end', () => [movedItem([1, 2], 0, -1), movedItem([1, 2], 1, 1)].should.deep.equal([[1, 2], [1, 2]]));
});

describe('when a saved value has items without identifiers', () => {
    const saved = { labels: ['Jan'], datasets: [{ label: 'Sales', data: [1, 2], borderColor: 'red' }] };
    const converted = withIdentities(chart, saved) as { datasets: { id: string; borderColor: string }[] };

    it('should not fit the collection Scene describes', () => validateValue(chart, saved)!.should.contain('every item needs an id'));
    it('should give each item an identifier', () => converted.datasets[0].id.length.should.be.greaterThan(0));
    it('should then fit it, the fields it does not describe kept', () => [validateValue(chart, converted), converted.datasets[0].borderColor].should.deep.equal([undefined, 'red']));
    it('should keep an identifier an item already has', () => (withIdentities(chart, { datasets: [{ id: 'mine' }] }) as { datasets: { id: string }[] }).datasets[0].id.should.equal('mine'));
    it('should change nothing it has no descriptor for', () => (withIdentities(chart, { other: [{ a: 1 }] }) as object).should.deep.equal({ other: [{ a: 1 }] }));
});
