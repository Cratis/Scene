// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { placeMenu, type MenuPlacementRequest } from '../menuPlacement';

const request = (overrides: Partial<MenuPlacementRequest>): MenuPlacementRequest => ({
    trigger: { left: 100, top: 20, right: 140, bottom: 60 },
    content: { width: 300, height: 400 },
    viewport: { width: 1000, height: 800 },
    gap: 8,
    margin: 8,
    ...overrides,
});

describe('when placing a menu', () => {
    it('should open below the button when the content fits there', () => {
        const placement = placeMenu(request({}));
        placement.side.should.equal('below');
        placement.top.should.equal(68);
        placement.height.should.equal(400);
    });

    it('should start at the left edge of the button', () => placeMenu(request({})).left.should.equal(100));

    it('should open above the button when it only fits there', () => {
        const placement = placeMenu(request({ trigger: { left: 100, top: 700, right: 140, bottom: 740 }, content: { width: 300, height: 400 } }));
        placement.side.should.equal('above');
        placement.top.should.equal(700 - 8 - 400);
        (placement.top + placement.height).should.be.at.most(700);
    });

    it('should cut the height to the room and scroll inside when it fits on neither side', () => {
        const placement = placeMenu(request({ content: { width: 300, height: 5000 } }));
        placement.side.should.equal('below');
        placement.height.should.equal(800 - 8 - 60 - 8);
        (placement.top + placement.height).should.be.at.most(800 - 8);
    });

    it('should choose the side with more room when it fits on neither', () => {
        const placement = placeMenu(request({ trigger: { left: 10, top: 500, right: 50, bottom: 540 }, content: { width: 300, height: 5000 } }));
        placement.side.should.equal('above');
        placement.top.should.equal(8);
        placement.height.should.equal(500 - 8 - 8);
    });

    it('should shift back into the window at its right edge', () => {
        const placement = placeMenu(request({ trigger: { left: 900, top: 20, right: 940, bottom: 60 } }));
        (placement.left + placement.width).should.equal(1000 - 8);
    });

    it('should never start outside the window at its left edge', () => placeMenu(request({ trigger: { left: -30, top: 20, right: 10, bottom: 60 } })).left.should.equal(8));

    it('should narrow to the window when it is wider than the window', () => {
        const placement = placeMenu(request({ viewport: { width: 200, height: 800 }, content: { width: 300, height: 100 } }));
        placement.width.should.equal(184);
        placement.left.should.equal(8);
    });
});
