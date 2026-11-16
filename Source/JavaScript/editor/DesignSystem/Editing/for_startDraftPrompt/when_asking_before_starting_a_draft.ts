// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../defaultDesignSystemEditorStrings';
import { startDraftPrompt } from '../startDraftPrompt';

const prompts = defaultDesignSystemEditorStrings.prompts;

describe('when asking before starting a draft', () => {
    it('should say the draft starts from the active version when there is one', () => startDraftPrompt(true, prompts).message.should.contain('active design system'));
    it('should say the draft starts from the starter when there is no active version', () => startDraftPrompt(false, prompts).title.should.equal('Start from the starter?'));
    it('should say nothing is the standard until a second person activates it', () => startDraftPrompt(false, prompts).message.should.contain('second person'));
    it('should ask in the words the host gave', () => startDraftPrompt(true, { ...prompts, startDraft: { title: 'Begin?', message: 'Sure?' } }).title.should.equal('Begin?'));
});
