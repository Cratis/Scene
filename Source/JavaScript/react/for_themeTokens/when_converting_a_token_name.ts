// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { themeTokenProperty } from '../index';

describe('when converting a token name', () => {
    it('should prefix a single-segment name', () => {
        themeTokenProperty('primary').should.equal('--scene-primary');
    });

    it('should join dotted segments with dashes', () => {
        themeTokenProperty('primary.color').should.equal('--scene-primary-color');
    });

    it('should split camelCase within a segment', () => {
        themeTokenProperty('surface.borderColor').should.equal('--scene-surface-border-color');
    });

    it('should handle a segment with a digit boundary', () => {
        themeTokenProperty('surface.level2Background').should.equal('--scene-surface-level2-background');
    });
});
