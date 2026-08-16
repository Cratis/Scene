// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { primeReactThemeNames, primeReactThemeStylesheet } from '../theme';

describe('when resolving a theme stylesheet', () => {
    describe('and the theme is one this package ships', () => {
        it('should point at the theme folder PrimeReact ships it in', () => {
            primeReactThemeStylesheet('lara-dark-indigo')!.should.equal('primereact/resources/themes/lara-dark-indigo/theme.css');
        });

        it('should resolve a path for every theme in the catalog', () => {
            primeReactThemeNames.filter((name) => primeReactThemeStylesheet(name) === undefined).should.deep.equal([]);
        });
    });

    describe('and the theme is unknown', () => {
        it('should resolve nothing rather than a path that would 404', () => {
            (primeReactThemeStylesheet('lara-light-chartreuse') === undefined).should.be.true;
        });
    });
});
