// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode } from '@cratis/scene.model';
import { insertDataField } from '../insertDataField';
import { insertionFor } from './given';

describe('when dropping a command property on a screen without a command form', () => {
    const { insertion, recorded } = insertionFor([], []);
    const refusal = insertDataField({ source: 'command', sliceId: 'slice-1', command: 'SetProductPrice', property: 'price', type: 'Money' }, { parentId: 'screen-root', index: 0 }, insertion);

    it('should not refuse', () => (refusal === undefined).should.be.true);
    it('should put a command form where it was dropped', () => recorded.inserted.map(entry => [entry.parentId, entry.index]).should.deep.equal([['screen-root', 0]]));
    it('should make the form of the package that offers it', () => (recorded.inserted[0].element as unknown as { componentName: string }).componentName.should.equal('Cratis.Components:commandForm'));
    it('should have the form submit the slice command', () => (recorded.inserted[0].element as unknown as { properties: { command: string } }).properties.command.should.equal('slice-1'));
    it('should give the screen a form for the command', () => recorded.forms[0].map(form => form.forCommand).should.deep.equal(['SetProductPrice']));
    it('should write the form out by hand', () => recorded.forms[0][0].generationMode!.should.equal(FormGenerationMode.Manual));
    it('should bind only the dropped property', () => recorded.forms[0][0].fields.map(field => [field.name, field.sourceProperty]).should.deep.equal([['price', 'price']]));
});
