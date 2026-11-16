// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toViewport } from '../toWindowSize';
import { viewportPresetSizes, windowChromeHeight } from '../viewportPresets';
import { ViewportPreset } from '../ViewportPreset';
import { defaultWindowSize, fitWindowSize, isLegacyDefaultWindow, resolveInitialWindowSize } from '../windowSizing';

const roomy = { width: 1900, height: 1000 };
const laptop = { width: 1302, height: 586 };
const desktop = viewportPresetSizes[ViewportPreset.Desktop];

describe('when nothing is known about the window', () => {
    it('should open the desktop preview at full size where there is room', () => toViewport(resolveInitialWindowSize({}, roomy)).should.deep.equal(desktop));
    it('should add the title bar to the preview', () => resolveInitialWindowSize({}, roomy).height.should.equal(desktop.height + windowChromeHeight));
    it('should take the room a small display has, instead of being cut off', () => resolveInitialWindowSize({}, laptop).should.deep.equal({ width: 1280, height: 586 }));
    it('should not be larger than the room in either direction', () => {
        const size = resolveInitialWindowSize({}, { width: 800, height: 500 });
        (size.width <= 800 && size.height <= 500).should.be.true;
    });
});

describe('when the window has been used before', () => {
    const remembered = { width: 1000, height: 700 };
    const saved = { width: 1100, height: 650 };
    const lastUsed = { width: 1200, height: 800 };

    it('should open at the size this person left this screen at before any other', () => resolveInitialWindowSize({ remembered, saved, lastUsed }, roomy).should.deep.equal(remembered));
    it('should open at the size saved with the screen when this person has none for it', () => resolveInitialWindowSize({ saved, lastUsed }, roomy).should.deep.equal(saved));
    it('should open at the size last used for any screen when the screen has none', () => resolveInitialWindowSize({ lastUsed }, roomy).should.deep.equal(lastUsed));
    it('should ignore a size that is not a size', () => resolveInitialWindowSize({ remembered: { width: 0, height: 700 }, saved }, roomy).should.deep.equal(saved));
    it('should ignore a size that is not a number', () => resolveInitialWindowSize({ remembered: { width: Number.NaN, height: 700 }, saved }, roomy).should.deep.equal(saved));
    it('should fit a remembered size that no longer fits the display', () => resolveInitialWindowSize({ remembered: { width: 3000, height: 2000 } }, laptop).should.deep.equal(laptop));
});

describe('when a screen was saved at the size every window used to open at', () => {
    it('should recognise it as the old default', () => isLegacyDefaultWindow({ width: 900, height: 640 }).should.be.true);
    it('should not take it for a choice', () => resolveInitialWindowSize({ saved: { width: 900, height: 640 } }, roomy).should.deep.equal(defaultWindowSize(roomy)));
    it('should still prefer what this person chose over it', () => resolveInitialWindowSize({ remembered: { width: 900, height: 640 }, saved: { width: 900, height: 640 } }, roomy).should.deep.equal({ width: 900, height: 640 }));
    it('should not take another size for the old default', () => isLegacyDefaultWindow({ width: 901, height: 640 }).should.be.false);
});

describe('when fitting a window', () => {
    it('should keep a size that already fits', () => fitWindowSize({ width: 800, height: 500 }, roomy).should.deep.equal({ width: 800, height: 500 }));
    it('should round to whole pixels', () => fitWindowSize({ width: 800.4, height: 500.6 }, roomy).should.deep.equal({ width: 800, height: 501 }));
});
