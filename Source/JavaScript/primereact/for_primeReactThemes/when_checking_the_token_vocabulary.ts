// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactThemes } from '../theme';

describe('when checking the token vocabulary', () => {
    const vocabulary = [
        'primary.color',
        'primary.contrastColor',
        'surface.background',
        'surface.card',
        'surface.border',
        'surface.hover',
        'surface.overlay',
        'text.color',
        'text.mutedColor',
        'highlight.background',
        'highlight.color',
        'content.borderRadius',
        'focus.ring',
    ];

    it('should give every theme the whole vocabulary', () => {
        const incomplete = primeReactThemes
            .filter((theme) => vocabulary.some((token) => theme.tokens?.[token] === undefined))
            .map((theme) => theme.name);
        incomplete.should.deep.equal([]);
    });

    it('should give every theme nothing but the vocabulary, so packages can agree on it', () => {
        const extra = primeReactThemes.flatMap((theme) => Object.keys(theme.tokens ?? {}).filter((token) => !vocabulary.includes(token)));
        extra.should.deep.equal([]);
    });

    it('should say whether every theme is dark', () => {
        primeReactThemes.filter((theme) => theme.isDark === undefined).should.deep.equal([]);
    });

    it('should ship both light and dark themes', () => {
        primeReactThemes.some((theme) => theme.isDark === true).should.be.true;
        primeReactThemes.some((theme) => theme.isDark === false).should.be.true;
    });

    it('should mirror the value the shipped stylesheet uses for its primary color', () => {
        primeReactThemes.find((theme) => theme.name === 'lara-light-blue')!.tokens!['primary.color'].should.equal('#3b82f6');
    });

    it('should replace the unresolved SCSS expression PrimeReact ships for the viva-dark hover surface', () => {
        primeReactThemes.find((theme) => theme.name === 'viva-dark')!.tokens!['surface.hover'].should.equal('rgba(158, 173, 230, 0.08)');
    });
});
