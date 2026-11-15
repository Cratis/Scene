// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataImportFormat } from '../SampleDataImportFormat';
import { importSampleData } from '../importSampleData';

const request = (text: string, format: SampleDataImportFormat, shape = 'Customer') => ({ id: 'acme', title: ' Acme ', shape, text, format });

describe('when importing a CSV data set', () => {
    const result = importSampleData(request('name,age,active,city\r\n"Fjordline, AS",42,true,Oslo\nNordlys,,false,"Tromsø ""north"""\n', SampleDataImportFormat.Csv));

    it('should read the header as the field names and type the values', () => {
        result.pack!.sets[0].rows[0].should.deep.equal({ name: 'Fjordline, AS', age: 42, active: true, city: 'Oslo' });
    });

    it('should leave out an empty cell and keep a doubled quote as one', () => {
        result.pack!.sets[0].rows[1].should.deep.equal({ name: 'Nordlys', active: false, city: 'Tromsø "north"' });
    });

    it('should put the rows in a set of the shape the user named', () => result.pack!.sets[0].shape.should.equal('Customer'));
    it('should make a user\'s pack with the title trimmed and the default locale', () => [result.pack!.title, result.pack!.owner, result.pack!.locale].should.deep.equal(['Acme', 'user', 'en-GB']));
    it('should have no problems', () => result.problems.should.deep.equal([]));
});

describe('when importing a JSON data set', () => {
    it('should read an array of rows into a set of the named shape', () => {
        importSampleData(request('[{"name":"A"},{"name":"B"}]', SampleDataImportFormat.Json)).pack!.sets.should.deep.equal([{ shape: 'Customer', rows: [{ name: 'A' }, { name: 'B' }] }]);
    });

    it('should read an object carrying its own shape', () => {
        importSampleData(request('{"shape":"Order","rows":[{"total":5}]}', SampleDataImportFormat.Json)).pack!.sets[0].shape.should.equal('Order');
    });

    it('should read the sets of a whole pack', () => {
        importSampleData(request('{"sets":[{"shape":"A","rows":[]},{"shape":"B","rows":[{"x":1}]}]}', SampleDataImportFormat.Json)).pack!.sets.map(set => set.shape).should.deep.equal(['A', 'B']);
    });
});

describe('when importing something that cannot be a data set', () => {
    it('should refuse text that is not JSON', () => importSampleData(request('{ nope', SampleDataImportFormat.Json)).problems[0].should.contain('not valid JSON'));
    it('should refuse JSON that is neither rows nor a pack', () => importSampleData(request('42', SampleDataImportFormat.Json)).problems[0].should.contain('array of rows'));
    it('should refuse rows that are not objects', () => importSampleData(request('[1,2]', SampleDataImportFormat.Json)).problems[0].should.contain('object'));
    it('should refuse an empty CSV', () => importSampleData(request('  \n', SampleDataImportFormat.Csv)).problems[0].should.contain('no rows'));
    it('should refuse a CSV column with no name', () => importSampleData(request('a,\n1,2', SampleDataImportFormat.Csv)).problems[0].should.contain('name'));
    it('should refuse a CSV that repeats a column', () => importSampleData(request('a,a\n1,2', SampleDataImportFormat.Csv)).problems[0].should.contain('more than once'));
});

describe('when Scene finds fault with an imported pack', () => {
    const result = importSampleData({ ...request('[{"name":"A"}]', SampleDataImportFormat.Json), id: 'Not A Valid Id' });

    it('should still return the pack so the user can correct it', () => (result.pack === undefined).should.be.false);
    it('should return Scene\'s problems with it', () => result.problems.length.should.be.greaterThan(0));
});
