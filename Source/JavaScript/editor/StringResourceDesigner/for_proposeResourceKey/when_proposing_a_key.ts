// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { proposeResourceKey } from '../proposeResourceKey';

describe('when proposing a key', () => {
    it('should camelCase multi-word text into the trailing key segment', () => {
        proposeResourceKey(['Invoicing', 'Actions'], 'New Invoice').should.equal('invoicing.actions.newInvoice');
    });

    it('should lowercase every scope segment', () => {
        proposeResourceKey(['Invoicing'], 'Title').should.equal('invoicing.title');
    });

    it('should propose a bare key when the scope is empty', () => {
        proposeResourceKey([], 'Title').should.equal('title');
    });

    it('should treat any run of punctuation as a word boundary', () => {
        proposeResourceKey([], 'Invoice, registered!').should.equal('invoiceRegistered');
    });
});
