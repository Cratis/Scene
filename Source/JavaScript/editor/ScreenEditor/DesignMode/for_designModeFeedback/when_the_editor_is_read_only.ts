// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { addOfferOf } from '../designModeFeedback';
import { readOnlyController } from '../../Host/readOnlyController';
import type { ScreenEditorController } from '../../Host/ScreenEditorController';

describe('when the editor is read only', () => {
    const offer = addOfferOf('Add button', 'This screen is open to be read.');

    it('should not let the plus be pressed', () => offer.disabled.should.be.true);
    it('should say why in place of what it would add', () => offer.title.should.equal('This screen is open to be read.'));
    it('should let the controller say why it cannot be edited', () => readOnlyController({} as ScreenEditorController, 'Read only').readOnlyReason!.should.equal('Read only'));
});

describe('when the editor can be edited', () => {
    const offer = addOfferOf('Add button', undefined);

    it('should let the plus be pressed', () => offer.disabled.should.be.false);
    it('should name what it adds', () => offer.title.should.equal('Add button'));
});
