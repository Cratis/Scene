// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { previewActionLabel } from '../previewActionLabel';

describe('when the action has no label', () => {
    it('should humanize the command as a sentence', () => previewActionLabel({ command: 'ChangeBasketQuantity' }).should.equal('Change basket quantity'));
    it('should treat a null label as absent', () => previewActionLabel({ command: 'RemoveLine', label: null }).should.equal('Remove line'));
    it('should treat a non-text label as absent', () => previewActionLabel({ command: 'RemoveLine', label: 12 }).should.equal('Remove line'));
    it('should preserve acronyms', () => previewActionLabel({ command: 'ExportPII' }).should.equal('Export PII'));
    it('should show no command text when the command is absent', () => previewActionLabel({}).should.equal(''));
});
