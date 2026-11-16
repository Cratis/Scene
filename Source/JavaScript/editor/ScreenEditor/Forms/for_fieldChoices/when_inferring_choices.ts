// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryCandidate } from '@cratis/scene.model';
import { choicesFor, defaultDisplayField, inferChoices, listQueriesOf, withChoices } from '../fieldChoices';

const list = (id: string, name: string, fields: { name: string; type: string; isIdentity?: boolean }[]): QueryCandidate =>
    ({ id, name, origin: [], parameters: [], resultShape: 'collection', resultFields: fields });
const categories = list('q-1', 'AllCategories', [{ name: 'id', type: 'CategoryId', isIdentity: true }, { name: 'slug', type: 'string' }, { name: 'name', type: 'string' }]);
const single: QueryCandidate = { id: 'q-2', name: 'CategoryById', origin: [], parameters: [], resultShape: 'single', resultFields: [{ name: 'id', type: 'CategoryId', isIdentity: true }] };

describe('when inferring the choices of a property', () => {
    it('should choose from the one list query whose rows are keyed by the type', () => inferChoices('CategoryId', [categories, single])!.should.deep.equal({ query: 'AllCategories', show: 'name' }));
    it('should offer nothing for a type that keys no read model', () => (inferChoices('Money', [categories]) === undefined).should.be.true);
    it('should offer nothing when two list queries return rows keyed by the type', () => (inferChoices('CategoryId', [categories, list('q-3', 'Recent', [{ name: 'id', type: 'CategoryId', isIdentity: true }])]) === undefined).should.be.true);
    it('should not take a query that returns one result for a list', () => listQueriesOf([categories, single]).map(query => query.name).should.deep.equal(['AllCategories']));
    it('should show the title when the rows have no name', () => defaultDisplayField(list('q', 'Q', [{ name: 'id', type: 'T', isIdentity: true }, { name: 'code', type: 'string' }, { name: 'title', type: 'string' }]))!.name.should.equal('title'));
    it('should show the first field that is not the key when the rows have neither', () => defaultDisplayField(list('q', 'Q', [{ name: 'id', type: 'T', isIdentity: true }, { name: 'code', type: 'string' }]))!.name.should.equal('code'));
});

describe('when reading the choices of a field', () => {
    const stated = withChoices({ name: 'category' }, { query: 'Recent', show: 'label' });

    it('should prefer what the field states', () => choicesFor(stated, 'CategoryId', [categories])!.query.should.equal('Recent'));
    it('should fall back on what the type implies', () => choicesFor({ name: 'category' }, 'CategoryId', [categories])!.query.should.equal('AllCategories'));
    it('should take the choices off a field', () => ('choices' in withChoices(stated, undefined)).should.be.false);
});
