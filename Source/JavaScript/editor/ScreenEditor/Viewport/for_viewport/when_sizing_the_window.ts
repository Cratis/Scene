// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HeightSizeClass, WidthSizeClass } from '@cratis/scene.model';
import { detectViewportPreset } from '../detectViewportPreset';
import { resolveViewportSizeClass } from '../resolveViewportSizeClass';
import { toViewport, toWindowSize } from '../toWindowSize';
import { viewportPresetSizes, windowChromeHeight } from '../viewportPresets';
import { ViewportPreset } from '../ViewportPreset';

const roomy = { width: 2000, height: 1200 };

describe('when the desktop preset has room', () => {
    const size = toWindowSize(viewportPresetSizes[ViewportPreset.Desktop], roomy);

    it('should give the screen the full desktop viewport', () => toViewport(size).should.deep.equal(viewportPresetSizes[ViewportPreset.Desktop]));
    it('should add the title bar on top of the viewport', () => size.height.should.equal(viewportPresetSizes[ViewportPreset.Desktop].height + windowChromeHeight));
    it('should evaluate a regular width class', () => resolveViewportSizeClass(size).width.should.equal(WidthSizeClass.Regular));
});

describe('when the mobile preset has room', () => {
    const size = toWindowSize(viewportPresetSizes[ViewportPreset.Mobile], roomy);

    it('should evaluate a compact width class', () => resolveViewportSizeClass(size).width.should.equal(WidthSizeClass.Compact));
    it('should evaluate a regular height class', () => resolveViewportSizeClass(size).height.should.equal(HeightSizeClass.Regular));
});

describe('when the display is smaller than a preset', () => {
    const size = toWindowSize(viewportPresetSizes[ViewportPreset.Desktop], { width: 1000, height: 700 });

    it('should shrink the window to what fits', () => size.should.deep.equal({ width: 1000, height: 700 }));
});

describe('when the window is resized continuously across the breakpoint', () => {
    it('should flip the width class at Scene\'s own breakpoint', () => {
        const below = resolveViewportSizeClass({ width: 599, height: 700 });
        const at = resolveViewportSizeClass({ width: 600, height: 700 });
        (below.width === WidthSizeClass.Compact && at.width === WidthSizeClass.Regular).should.be.true;
    });
});

describe('when detecting which preset the window matches', () => {
    it('should recognise a window sized by a preset', () =>
        detectViewportPreset(toWindowSize(viewportPresetSizes[ViewportPreset.Mobile], roomy), roomy)!.should.equal(ViewportPreset.Mobile));

    it('should recognise nothing for a hand-resized window', () =>
        (detectViewportPreset({ width: 777, height: 555 }, roomy) === undefined).should.be.true);
});
