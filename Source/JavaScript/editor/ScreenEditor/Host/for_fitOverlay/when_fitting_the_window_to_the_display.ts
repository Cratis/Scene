// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fitOverlay, overlayMargin } from '../fitOverlay';

const left = (fitted: { width: number; offsetX: number }, viewportWidth: number) => viewportWidth / 2 + fitted.offsetX - fitted.width / 2;

describe('when fitting the window to the display', () => {
    it('should leave a window that fits where it was asked to be', () => fitOverlay({ width: 900, height: 700 }, { width: 1600, height: 1000 }, -180).should.deep.equal({ width: 900, height: 700, offsetX: -180 }));
    it('should keep a window beside the inspector inside the display', () => left(fitOverlay({ width: 900, height: 700 }, { width: 1024, height: 768 }, -180), 1024).should.be.at.least(overlayMargin));
    it('should keep a window beside the inspector from leaving the other edge', () => {
        const fitted = fitOverlay({ width: 900, height: 700 }, { width: 1024, height: 768 }, 400);
        (left(fitted, 1024) + fitted.width).should.be.at.most(1024 - overlayMargin);
    });
    it('should shrink a window the display has no room for', () => fitOverlay({ width: 900, height: 700 }, { width: 390, height: 844 }, -180).width.should.equal(390 - overlayMargin * 2));
    it('should centre a window that fills the width', () => fitOverlay({ width: 900, height: 700 }, { width: 390, height: 844 }, -180).offsetX.should.equal(0));
    it('should shrink a window the display has no height for', () => fitOverlay({ width: 400, height: 900 }, { width: 1600, height: 600 }, 0).height.should.equal(600 - overlayMargin * 2));
    it('should never fit a window to nothing', () => fitOverlay({ width: 400, height: 400 }, { width: 0, height: 0 }, 0).width.should.equal(1));
});
