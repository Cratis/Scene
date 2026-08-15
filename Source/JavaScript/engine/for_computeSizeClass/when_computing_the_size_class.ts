// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HeightSizeClass, WidthSizeClass } from '@cratis/scene.model';
import { computeSizeClass, defaultHeightBreakpoint, defaultWidthBreakpoint } from '../index';

describe('when computing the size class', () => {
    it('should be compact by compact below both breakpoints', () => {
        computeSizeClass(320, 480).should.deep.equal({ width: WidthSizeClass.Compact, height: HeightSizeClass.Compact });
    });

    it('should be regular width below height breakpoint only', () => {
        computeSizeClass(1024, 480).should.deep.equal({ width: WidthSizeClass.Regular, height: HeightSizeClass.Compact });
    });

    it('should be regular by regular at exactly both breakpoints', () => {
        computeSizeClass(defaultWidthBreakpoint, defaultHeightBreakpoint).should.deep.equal({ width: WidthSizeClass.Regular, height: HeightSizeClass.Regular });
    });

    it('should honor a custom breakpoint', () => {
        computeSizeClass(500, 500, 400).width.should.equal(WidthSizeClass.Regular);
    });
});
