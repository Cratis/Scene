// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { windowChromeHeight } from '../../Viewport/viewportPresets';
import { thumbnailGeometry, thumbnailMaxBodyHeight, thumbnailWidth } from '../thumbnailGeometry';

describe('when shaping the miniature of a window', () => {
    const geometry = thumbnailGeometry({ width: 1200, height: 640 });

    it('should lay the screen out at the width of the window', () => geometry.canvasWidth.should.equal(1200));
    it('should lay the screen out at the height of the window less its title bar', () => geometry.canvasHeight.should.equal(640 - windowChromeHeight));
    it('should show it at the board\'s width', () => geometry.width.should.equal(thumbnailWidth));
    it('should keep the proportions of the window', () => (geometry.bodyHeight / geometry.width).should.be.closeTo((640 - windowChromeHeight) / 1200, 0.01));
    it('should scale by the one factor in both directions', () => geometry.scale.should.equal(thumbnailWidth / 1200));
});

describe('when the window size is not known', () => {
    for (const [name, size] of [['missing', undefined], ['zero', { width: 0, height: 0 }]] as const)
        it(`should draw the desktop preview when it is ${name}`, () => thumbnailGeometry(size).canvasWidth.should.equal(1280));
});

describe('when a larger preview asks for its own width', () => {
    it('should scale to it', () => thumbnailGeometry({ width: 1000, height: 600 }, 500).width.should.equal(500));
});

describe('when the window is much taller than it is wide', () => {
    const geometry = thumbnailGeometry({ width: 390, height: 884 }, thumbnailWidth, thumbnailMaxBodyHeight);

    it('should fit the height the board has room for', () => geometry.bodyHeight.should.be.at.most(thumbnailMaxBodyHeight));
    it('should be narrower than the board\'s width rather than taller than its room', () => geometry.width.should.be.lessThan(thumbnailWidth));
    it('should keep the proportions of the window', () => (geometry.bodyHeight / geometry.width).should.be.closeTo((884 - windowChromeHeight) / 390, 0.05));
});
