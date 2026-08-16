// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyPrimeReactTheme } from '../theme';

describe('when swapping the theme stylesheet', () => {
    afterEach(() => {
        document.getElementById('theme-link')?.remove();
    });

    describe('and the application already declared a theme link', () => {
        let swapped: boolean;

        beforeEach(() => {
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('id', 'theme-link');
            link.setAttribute('href', '/assets/themes/lara-light-blue/theme.css');
            document.head.appendChild(link);
            swapped = applyPrimeReactTheme('soho-dark');
        });

        it('should report that it swapped', () => {
            swapped.should.be.true;
        });

        it('should rewrite only the theme folder, leaving the application in charge of where themes are served from', () => {
            document.getElementById('theme-link')!.getAttribute('href')!.should.equal('/assets/themes/soho-dark/theme.css');
        });

        it('should leave exactly one theme link behind', () => {
            document.querySelectorAll('#theme-link').should.have.lengthOf(1);
        });
    });

    describe('and the theme name also appears elsewhere in the url', () => {
        beforeEach(() => {
            const link = document.createElement('link');
            link.setAttribute('id', 'theme-link');
            link.setAttribute('href', '/nano/themes/nano/theme.css');
            document.head.appendChild(link);
            applyPrimeReactTheme('mira');
        });

        it('should rewrite the theme folder and not the rest of the path', () => {
            document.getElementById('theme-link')!.getAttribute('href')!.should.equal('/nano/themes/mira/theme.css');
        });
    });

    describe('and no theme link exists yet', () => {
        let swapped: boolean;

        beforeEach(() => {
            swapped = applyPrimeReactTheme('mira');
        });

        it('should report that it swapped', () => {
            swapped.should.be.true;
        });

        it('should create the link rather than refuse to theme the page', () => {
            document.getElementById('theme-link')!.getAttribute('href')!.should.equal('primereact/resources/themes/mira/theme.css');
        });
    });

    describe('and the theme is unknown', () => {
        let swapped: boolean;

        beforeEach(() => {
            swapped = applyPrimeReactTheme('lara-light-chartreuse');
        });

        it('should report that it did not swap', () => {
            swapped.should.be.false;
        });

        it('should not create a link to a stylesheet that does not exist', () => {
            (document.getElementById('theme-link') === null).should.be.true;
        });
    });
});
