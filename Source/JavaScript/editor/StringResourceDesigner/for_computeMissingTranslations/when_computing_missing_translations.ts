// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { computeMissingTranslations } from '../computeMissingTranslations';
import { MissingTranslation } from '../MissingTranslation';

describe('when computing missing translations', () => {
    let result: MissingTranslation[];

    beforeEach(() => {
        result = computeMissingTranslations({
            en: { 'invoices.title': 'Invoices', 'invoices.actions.new': 'New invoice' },
            nb: { 'invoices.title': 'Fakturaer' },
        });
    });

    it('should report only keys missing from at least one locale', () => {
        result.length.should.equal(1);
        result[0].key.should.equal('invoices.actions.new');
    });

    it('should list every locale the key is missing from', () => {
        result[0].missingLocales.should.deep.equal(['nb']);
    });

    it('should report nothing when every key is present in every locale', () => {
        computeMissingTranslations({ en: { a: '1' }, nb: { a: '2' } }).should.have.lengthOf(0);
    });
});
