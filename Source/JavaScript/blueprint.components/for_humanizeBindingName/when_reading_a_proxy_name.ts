// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { humanizeBindingName } from '../header';

describe('when reading a proxy name', () => {
    it('should read a two-word query name as a sentence', () => {
        humanizeBindingName('AllInvoices').should.equal('All invoices');
    });

    it('should read a command name as a sentence', () => {
        humanizeBindingName('RecordAdjustment').should.equal('Record adjustment');
    });

    it('should lower every word after the first', () => {
        humanizeBindingName('InvoicesInFlight').should.equal('Invoices in flight');
    });

    it('should leave a single word alone', () => {
        humanizeBindingName('Invoices').should.equal('Invoices');
    });

    it('should split a word boundary that follows a digit', () => {
        humanizeBindingName('Top10Customers').should.equal('Top10 customers');
    });

    it('should keep a run of capitals together rather than chopping it into initials', () => {
        humanizeBindingName('AllPIIRecords').should.equal('All PIIRecords');
    });

    it('should return an empty name unchanged rather than inventing a heading', () => {
        humanizeBindingName('').should.equal('');
    });
});
