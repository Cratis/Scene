// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { previewActionLabel } from '../previewActionLabel';

describe('when the action has a label', () => {
    it('should use the label instead of the command', () => previewActionLabel({ command: 'ChangeBasketQuantity', label: 'Change quantity' }).should.equal('Change quantity'));
    it('should keep the label exactly as written', () => previewActionLabel({ command: 'RemoveLine', label: 'Remove THIS line' }).should.equal('Remove THIS line'));
    it('should preserve an explicitly empty label as Scene does', () => previewActionLabel({ command: 'RemoveLine', label: '' }).should.equal(''));
});
