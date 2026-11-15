// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { placeFloatingToolbar } from '../placeFloatingToolbar';

const bounds = { left: 0, top: 0, width: 1000, height: 600 };
const size = { width: 380, height: 100 };

describe('when the item has room above and below', () => {
    const item = { left: 100, top: 300, width: 80, height: 30 };
    it('should go above for a button', () => { const placed = placeFloatingToolbar({ anchor: item, bounds, size, prefer: 'above' }); placed.side.should.equal('above'); placed.top.should.equal(300 - 6 - 100); });
    it('should go below for a navigation item', () => { const placed = placeFloatingToolbar({ anchor: item, bounds, size, prefer: 'below' }); placed.side.should.equal('below'); placed.top.should.equal(336); });
    it('should be left-aligned with the item', () => placeFloatingToolbar({ anchor: item, bounds, size, prefer: 'below' }).left.should.equal(100));
});

describe('when the item is at the top and the toolbar prefers above', () => {
    it('should go below instead', () => placeFloatingToolbar({ anchor: { left: 10, top: 20, width: 80, height: 30 }, bounds, size, prefer: 'above' }).side.should.equal('below'));
});

describe('when the item is at the bottom and the toolbar prefers below', () => {
    it('should go above instead', () => placeFloatingToolbar({ anchor: { left: 10, top: 560, width: 80, height: 30 }, bounds, size, prefer: 'below' }).side.should.equal('above'));
});

describe('when the item is near the right edge', () => {
    it('should be pushed back so it stays inside the surface', () => placeFloatingToolbar({ anchor: { left: 900, top: 300, width: 80, height: 30 }, bounds, size, prefer: 'below' }).left.should.equal(620));
});

describe('when there is no room on either side', () => {
    it('should stay inside the surface', () => {
        const placed = placeFloatingToolbar({ anchor: { left: 0, top: 20, width: 80, height: 60 }, bounds: { left: 0, top: 0, width: 1000, height: 120 }, size, prefer: 'above' });
        placed.top.should.be.within(0, 20);
    });
});
