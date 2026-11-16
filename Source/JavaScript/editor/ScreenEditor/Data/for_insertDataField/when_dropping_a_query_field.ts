// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { insertDataField } from '../insertDataField';
import { insertionFor } from './given';

describe('when dropping a field a query returns', () => {
    const { insertion, recorded } = insertionFor([], []);
    insertDataField({ source: 'query', queryId: 'q-1', query: 'ProductBySku', field: 'name', type: 'string' }, { parentId: 'screen-root', index: 1 }, insertion);
    const properties = (recorded.inserted[0].element as unknown as { properties: { query: { queryId: string }; resultField: string } }).properties;

    it('should put a single result on the screen', () => (recorded.inserted[0].element as unknown as { componentName: string }).componentName.should.equal('Cratis.Components:singleResult'));
    it('should bind it to the query', () => properties.query.queryId.should.equal('q-1'));
    it('should show the dropped field', () => properties.resultField.should.equal('name'));
    it('should leave the forms alone', () => recorded.forms.length.should.equal(0));
});

describe('when the profile offers nothing to show a query field with', () => {
    const { insertion, recorded } = insertionFor([], [], { core: ['text'] });
    const refusal = insertDataField({ source: 'query', queryId: 'q-1', query: 'ProductBySku', field: 'name', type: 'string' }, { parentId: undefined, index: undefined }, insertion);

    it('should say so', () => refusal!.should.equal('noSingleResult'));
    it('should put nothing on the screen', () => recorded.inserted.length.should.equal(0));
});

describe('when dropping a field of a query the screen does not know', () => {
    const { insertion } = insertionFor([], []);
    const refusal = insertDataField({ source: 'query', queryId: 'gone', query: 'Gone', field: 'name', type: 'string' }, { parentId: undefined, index: undefined }, insertion);

    it('should say so', () => refusal!.should.equal('unknownQuery'));
});
