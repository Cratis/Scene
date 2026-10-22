// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { accessiblePrimaryContrast } from '../theme/accessiblePrimaryContrast';

describe('when resolving the primary foreground for filled controls', () => {
    it('should keep an accessible light preset pair', () => {
        accessiblePrimaryContrast('#673ab7', '#ffffff').should.equal('#ffffff');
    });

    it('should keep an accessible dark preset pair', () => {
        accessiblePrimaryContrast('#818cf8', '#18181b').should.equal('#18181b');
    });

    it('should replace white on the light teal fill with black', () => {
        accessiblePrimaryContrast('#14b8a6', '#ffffff').should.equal('#000000');
    });

    it('should choose white when it contrasts better than black', () => {
        accessiblePrimaryContrast('#AB47BC', '#18181b').should.equal('#ffffff');
    });
});
