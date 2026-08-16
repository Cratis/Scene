// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactThemeLicense, primeReactThemeLicenseUrl, primeReactThemes } from '../theme';

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

    it('should credit PrimeTek, whose presets every one of them is built on', () => {
        primeReactThemes.filter((theme) => theme.author !== 'PrimeTek').should.deep.equal([]);
    });

    /**
     * The assertion this spec exists for. Until PrimeReact 11 these themes really were MIT, and the
     * previous version of this file pinned exactly that. Relicensing is invisible to a compiler and to
     * every other spec in this package, so without a spec that names the current license out loud, the
     * catalog would have gone on advertising MIT indefinitely.
     */
    it('should state the commercial license PrimeReact 11 actually ships under, not the MIT of v10', () => {
        primeReactThemeLicense.should.equal('PrimeUI Community / Commercial');
        primeReactThemes.filter((theme) => theme.license !== primeReactThemeLicense).should.deep.equal([]);
    });

    /**
     * A license name on its own does not tell a reader whether they qualify for the free Community tier
     * or owe a commercial fee. The link is the part that answers that, so it is pinned too.
     */
    it('should link to the terms on every theme, not just name them', () => {
        primeReactThemeLicenseUrl.should.equal('https://primeui.dev/licenses/community');
        primeReactThemes.filter((theme) => theme.licenseUrl !== primeReactThemeLicenseUrl).should.deep.equal([]);
    });

    it('should describe every theme for a picker', () => {
        primeReactThemes.filter((theme) => theme.description === undefined || theme.description === '').should.deep.equal([]);
    });
});
