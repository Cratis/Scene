// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode } from '@cratis/scene.model';
import { generateForm } from '../insertDataField';
import { insertionFor, placedForm } from './given';

describe('when generating the form of a screen without one', () => {
    const { insertion, recorded } = insertionFor([], []);
    const refusal = generateForm('slice-1', { parentId: 'screen-root', index: 0 }, insertion);

    it('should not refuse', () => (refusal === undefined).should.be.true);
    it('should place every property of the command', () => recorded.forms[0][0].fields.map(field => field.name).should.deep.equal(['sku', 'price']));
    it('should write the form out by hand', () => recorded.forms[0][0].generationMode!.should.equal(FormGenerationMode.Manual));
    it('should put one command form on the screen', () => recorded.inserted.length.should.equal(1));
});

describe('when generating the form of a screen that has one with a property placed', () => {
    const { insertion, recorded } = insertionFor([placedForm()], [{ name: 'SetProductPrice', forCommand: 'SetProductPrice', generationMode: FormGenerationMode.Manual, fields: [{ name: 'price', sourceProperty: 'price', label: 'Cost' }] }]);
    generateForm('slice-1', { parentId: 'screen-root', index: 0 }, insertion);

    it('should add only what is missing, after what is there', () => recorded.forms[0][0].fields.map(field => field.name).should.deep.equal(['price', 'sku']));
    it('should keep what the author wrote', () => recorded.forms[0][0].fields[0].label!.should.equal('Cost'));
    it('should not put another command form on the screen', () => recorded.inserted.length.should.equal(0));
});

describe('when generating the form of a command nothing knows', () => {
    const { insertion } = insertionFor([], []);

    it('should refuse', () => generateForm('nothing', { parentId: undefined, index: undefined }, insertion)!.should.equal('unknownCommand'));
});
