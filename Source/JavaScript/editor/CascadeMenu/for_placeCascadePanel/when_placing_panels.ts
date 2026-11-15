// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { placePanelBelow, placePanelBeside } from '../placeCascadePanel';

const bounds = { width: 1000, height: 800 };
const size = { width: 200, height: 300 };

describe('when placing the first panel of a menu', () => {
    it('should open under the control, aligned to its left edge', () => placePanelBelow({ top: 100, left: 50, width: 100, height: 30 }, size, bounds).should.deep.equal({ left: 50, top: 134 }));
    it('should open over the control when there is no room below', () => placePanelBelow({ top: 700, left: 50, width: 100, height: 30 }, size, bounds).top.should.equal(396));
    it('should stay inside the viewport on the right', () => placePanelBelow({ top: 100, left: 950, width: 40, height: 30 }, size, bounds).left.should.equal(792));
});

describe('when placing a submenu panel', () => {
    it('should open to the right of the row, level with it', () => placePanelBeside({ top: 200, left: 100, width: 180, height: 30 }, size, bounds).should.deep.equal({ left: 284, top: 196 }));
    it('should open to the left when there is no room on the right', () => placePanelBeside({ top: 200, left: 700, width: 180, height: 30 }, size, bounds).left.should.equal(496));
    it('should be pulled up when it would run off the bottom', () => placePanelBeside({ top: 700, left: 100, width: 180, height: 30 }, size, bounds).top.should.equal(492));
});
