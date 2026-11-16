// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { readButtonLook } from '../button/readButtonLook';

const button = (properties: Record<string, unknown>): SceneElement => ({ id: 'button', properties });

describe('when reading the look of a button', () => {
    describe('and nothing is chosen', () => {
        it('should be PrimeReact\'s default', () => readButtonLook(button({})).should.deep.equal({}));
        it('should treat the primary severity as that default', () => readButtonLook(button({ severity: 'primary' })).should.deep.equal({}));
    });

    describe('and a severity is chosen', () => {
        for (const severity of ['secondary', 'success', 'info', 'warn', 'danger', 'help', 'contrast']) {
            it(`should take ${severity} as the severity`, () => readButtonLook(button({ severity })).should.deep.equal({ severity }));
        }

        it('should translate the v10 warning severity', () => readButtonLook(button({ severity: 'warning' })).should.deep.equal({ severity: 'warn' }));
        it('should ignore a severity PrimeReact does not know', () => readButtonLook(button({ severity: 'fuchsia' })).should.deep.equal({}));
    });

    describe('and a form is chosen as the severity, the way a design system lists its variants', () => {
        for (const variant of ['outlined', 'text', 'link']) {
            it(`should take ${variant} as the form, with no severity`, () => readButtonLook(button({ severity: variant })).should.deep.equal({ variant }));
        }
    });

    describe('and a form is chosen by its flag', () => {
        it('should take outlined', () => readButtonLook(button({ outlined: true })).should.deep.equal({ variant: 'outlined' }));
        it('should take text', () => readButtonLook(button({ text: true })).should.deep.equal({ variant: 'text' }));
        it('should take link', () => readButtonLook(button({ link: true })).should.deep.equal({ variant: 'link' }));
        it('should prefer outlined to text when both are set', () => readButtonLook(button({ outlined: true, text: true })).should.deep.equal({ variant: 'outlined' }));
        it('should combine the form with a severity', () => readButtonLook(button({ severity: 'danger', outlined: true })).should.deep.equal({ severity: 'danger', variant: 'outlined' }));
        it('should ignore a flag that is false', () => readButtonLook(button({ outlined: false })).should.deep.equal({}));
    });

    describe('and a form is chosen both as the severity and by a flag', () => {
        it('should take the one chosen as the severity', () => readButtonLook(button({ severity: 'link', outlined: true })).should.deep.equal({ variant: 'link' }));
    });
});
