// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { regimeOf, touchWidth } from '../Stage/regimeOf';

describe('when the preview is as wide as a desktop', () => {
    const regime = regimeOf(1280, 'static');

    it('should be the pointer regime', () => regime.touch.should.be.false);
    it('should be a regular width', () => regime.widthClass.should.equal('regular'));
    it('should have nothing to say about the menu', () => (regime.note === undefined).should.be.true);
});

describe('when the preview is as wide as a phone', () => {
    const regime = regimeOf(390, 'slim');

    it('should be the touch regime', () => regime.touch.should.be.true);
    it('should be a compact width', () => regime.widthClass.should.equal('compact'));
    it('should say the menu is a drawer, in Scene\'s words', () => regime.note!.should.equal('On a touch screen the menu is always a drawer'));
});

describe('when the preview is a phone and the mode needs hover', () => {
    it('should say so', () => regimeOf(390, 'reveal').note!.should.contain('needs hover'));
});

describe('when the preview is a phone and the mode is already a drawer', () => {
    it('should have nothing to say', () => (regimeOf(390, 'drawer').note === undefined).should.be.true);
});

describe('when the width is on the edge', () => {
    it('should be touch at the touch width and not above it', () => [regimeOf(touchWidth, 'static').touch, regimeOf(touchWidth + 1, 'static').touch].should.deep.equal([true, false]));
});

describe('when the mode is the legacy spelling or unknown', () => {
    it('should read slim-plus as Slim+', () => regimeOf(390, 'slim-plus').note!.should.equal('On a touch screen the menu is always a drawer'));
    it('should treat an unknown mode as the default', () => regimeOf(1280, 'sideways').touch.should.be.false);
});
