// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { accentContrastToken, accentToken, applyAccent, supportsAccent } from '../applyAccent';

describe('when applying an accent', () => {
    const tokenised: Theme = { name: 'A', compatibleWith: [], tokens: { [accentToken]: '#4f46e5', [accentContrastToken]: '#ffffff' } };
    const untokenised: Theme = { name: 'B', compatibleWith: [] };

    it('should set the accent token on themes that have one', () => {
        applyAccent([tokenised], '#336699')[0].tokens![accentToken].should.equal('#336699');
    });

    it('should choose white text on a dark accent and black on a light one', () => {
        applyAccent([tokenised], '#222222')[0].tokens![accentContrastToken].should.equal('#ffffff');
        applyAccent([tokenised], '#ffee00')[0].tokens![accentContrastToken].should.equal('#000000');
    });

    it('should leave themes without the token untouched', () => {
        applyAccent([untokenised], '#336699')[0].should.equal(untokenised);
        supportsAccent(untokenised).should.be.false;
    });

    it('should not modify the original theme', () => {
        applyAccent([tokenised], '#336699');
        tokenised.tokens![accentToken].should.equal('#4f46e5');
    });

    it('should do nothing for an empty or malformed accent', () => {
        const themes = [tokenised];
        applyAccent(themes, '').should.equal(themes);
        applyAccent(themes, 'blue').should.equal(themes);
    });
});
