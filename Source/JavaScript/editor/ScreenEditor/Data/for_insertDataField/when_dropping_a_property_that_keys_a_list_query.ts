// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryCandidate } from '@cratis/scene.model';
import { choicesOf } from '../../Forms/fieldChoices';
import { insertDataField } from '../insertDataField';
import { insertionFor } from './given';

const allProducts: QueryCandidate = {
    id: 'q-all', name: 'AllProducts', origin: [], parameters: [], resultShape: 'collection',
    resultFields: [{ name: 'sku', type: 'ProductSku', isIdentity: true }, { name: 'name', type: 'string' }],
};

describe('when dropping a command property whose type is the key of a list query', () => {
    const { insertion, recorded } = insertionFor([], [], undefined, [allProducts]);
    insertDataField({ source: 'command', sliceId: 'slice-1', command: 'SetProductPrice', property: 'sku', type: 'ProductSku' }, { parentId: 'screen-root', index: 0 }, insertion);
    const field = recorded.forms[0][0].fields[0];

    it('should make the field a picker over that query', () => choicesOf(field)!.should.deep.equal({ query: 'AllProducts', show: 'name' }));
    it('should still bind the field to the property', () => field.sourceProperty!.should.equal('sku'));
});

describe('when dropping a command property that keys no list query', () => {
    const { insertion, recorded } = insertionFor([], [], undefined, [allProducts]);
    insertDataField({ source: 'command', sliceId: 'slice-1', command: 'SetProductPrice', property: 'price', type: 'Money' }, { parentId: 'screen-root', index: 0 }, insertion);

    it('should make a plain field', () => (choicesOf(recorded.forms[0][0].fields[0]) === undefined).should.be.true);
});
