// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fitToStage, regionOnStage } from '../Stage/stageScale';

describe('when the stage has room for the whole preview', () => {
    const fit = fitToStage({ width: 1280, height: 720 }, { width: 1400, height: 800 });

    it('should not enlarge it past its own size', () => fit.scale.should.equal(1));
    it('should take the room it needs', () => [fit.width, fit.height].should.deep.equal([1280, 720]));
});

describe('when the stage is narrower than the preview', () => {
    const fit = fitToStage({ width: 1280, height: 720 }, { width: 688, height: 800 });

    it('should shrink it to fit the width, leaving the margin', () => fit.scale.should.equal(0.5));
    it('should keep its shape', () => [fit.width, fit.height].should.deep.equal([640, 360]));
});

describe('when the stage is shorter than the preview', () => {
    const fit = fitToStage({ width: 390, height: 844 }, { width: 800, height: 470 });

    it('should shrink it to fit the height', () => fit.scale.should.be.closeTo(422 / 844, 0.001));
});

describe('when the stage has no room at all', () => {
    const fit = fitToStage({ width: 390, height: 844 }, { width: 0, height: 0 });

    it('should still answer a scale that is a number above zero', () => (fit.scale > 0 && Number.isFinite(fit.scale)).should.be.true);
});

describe('when a region is drawn over a scaled preview', () => {
    const box = regionOnStage({ x: 100, y: 40, width: 240, height: 600 }, { scale: 0.5, width: 640, height: 360 });

    it('should be scaled with it', () => box.should.deep.equal({ left: 50, top: 20, width: 120, height: 300 }));
});
