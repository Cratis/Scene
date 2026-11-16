// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { canvasGap, nominalElementHeight, placementBelow, type PlacedBox } from '../placeOnCanvas';

// Elements added from the palette used to be stepped diagonally by a fixed offset, so a button landed on the switch before it and a code block
// on the one before that.
describe('when placing an element added without a drop point', () => {
    it('should use the corner of an empty canvas, inside the margin', () => placementBelow([]).should.deep.equal({ left: 16, top: 16 }));

    it('should go below the only element, clear of its measured height', () =>
        placementBelow([{ placement: { left: 16, top: 16 }, height: 120 }]).top.should.equal(16 + 120 + canvasGap));

    it('should go below the lowest, not the last added', () => {
        const existing: PlacedBox[] = [{ placement: { left: 16, top: 200 }, height: 30 }, { placement: { left: 16, top: 16 }, height: 40 }];
        placementBelow(existing).top.should.equal(200 + 30 + canvasGap);
    });

    it('should clear a tall element above a short one', () => {
        const existing: PlacedBox[] = [{ placement: { left: 16, top: 16 }, height: 500 }, { placement: { left: 300, top: 100 }, height: 20 }];
        placementBelow(existing).top.should.equal(16 + 500 + canvasGap);
    });

    it('should assume a control\'s height for one that has not been measured', () =>
        placementBelow([{ placement: { left: 16, top: 16 } }]).top.should.equal(16 + nominalElementHeight + canvasGap));

    it('should stack elements with no position one after another, as the flow draws them', () =>
        placementBelow([{ height: 60 }, { height: 100 }, { height: 30 }]).top.should.equal(60 + 100 + 30 + canvasGap));

    // A screen migrated from a template keeps its content in flow at the top, thousands of pixels tall, and what was placed on the canvas lay on it.
    it('should trust where an element was measured over where it was placed', () =>
        placementBelow([{ placement: { left: 16, top: 16 }, height: 40, bottom: 2300 }]).top.should.equal(2300 + canvasGap));

    it('should go below flowing content even when what was placed is higher', () =>
        placementBelow([{ height: 700, bottom: 700 }, { height: 1100, bottom: 1800 }, { placement: { left: 16, top: 16 }, height: 40 }]).top.should.equal(1800 + canvasGap));

    // A divider's margins are part of the box the canvas gives it, so a box measured by what is drawn would put the next element on them.
    it('should clear the box the canvas gives an element, margins included', () =>
        placementBelow([{ placement: { left: 16, top: 100 }, height: 60, bottom: 160 }, { placement: { left: 16, top: 160 }, height: 120, bottom: 280 }]).top.should.equal(280 + canvasGap));

    it('should stay at the left margin', () => placementBelow([{ placement: { left: 400, top: 16 }, height: 20 }]).left.should.equal(16));

    it('should never overlap, however many are added in turn', () => {
        const heights = [24, 120, 40, 200, 36, 60];
        const placed: PlacedBox[] = [];
        for (const height of heights) placed.push({ placement: placementBelow(placed), height });
        for (let index = 1; index < placed.length; index++) {
            const above = placed[index - 1];
            (placed[index].placement!.top >= above.placement!.top + above.height!).should.be.true;
        }
    });
});
