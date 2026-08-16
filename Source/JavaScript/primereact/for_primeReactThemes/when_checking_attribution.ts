// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactThemes } from '../theme';

describe('when checking attribution', () => {
    it('should credit an author on every theme', () => {
        primeReactThemes.filter((theme) => theme.author === undefined || theme.author === '').should.deep.equal([]);
    });

    it('should link to the author on every theme', () => {
        primeReactThemes.filter((theme) => theme.authorUrl === undefined || theme.authorUrl === '').should.deep.equal([]);
    });

    it('should state a license on every theme', () => {
        primeReactThemes.filter((theme) => theme.license === undefined || theme.license === '').should.deep.equal([]);
    });

    it('should credit PrimeTek, who made every one of them', () => {
        primeReactThemes.filter((theme) => theme.author !== 'PrimeTek').should.deep.equal([]);
    });

    it('should state the license the primereact package actually ships under', () => {
        primeReactThemes.filter((theme) => theme.license !== 'MIT').should.deep.equal([]);
    });

    it('should describe every theme for a picker', () => {
        primeReactThemes.filter((theme) => theme.description === undefined || theme.description === '').should.deep.equal([]);
    });
});
