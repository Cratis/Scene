// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../defaultDesignSystemEditorStrings';
import { sampleDesignSystem } from '../../Testing/sampleDesignSystem';
import { wordsOf } from '../wordsOf';

describe('when reading the words', () => {
    const groups = wordsOf(sampleDesignSystem(), defaultDesignSystemEditorStrings.words);

    it('should have the voice and the naming', () => groups.map(group => group.kind).should.deep.equal(['voice', 'naming']));
    it('should title each group', () => groups.map(group => group.title).should.deep.equal(['Voice', 'Naming']));
    it('should list the voice in the order the design system gives it', () => groups[0].words.map(word => word.key).should.deep.equal(['tone', 'address']));
    it('should carry what a word says', () => groups[1].words.find(word => word.key === 'customer')!.text.should.equal('Client'));
    it('should list nothing for a design system that declares no words', () => {
        const none = wordsOf({ ...sampleDesignSystem(), words: undefined }, defaultDesignSystemEditorStrings.words);
        none.map(group => group.words.length).should.deep.equal([0, 0]);
    });
});
