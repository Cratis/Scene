// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CascadeStep, focusTarget, stepForKey } from '../cascadeNavigation';

describe('when moving through the rows of a cascading menu', () => {
    it('should step to the next row', () => focusTarget(CascadeStep.Next, 1, 4).should.equal(2));
    it('should wrap from the last row to the first', () => focusTarget(CascadeStep.Next, 3, 4).should.equal(0));
    it('should wrap from the first row to the last when stepping back', () => focusTarget(CascadeStep.Previous, 0, 4).should.equal(3));
    it('should land on the first row when nothing has focus yet', () => focusTarget(CascadeStep.Next, -1, 4).should.equal(0));
    it('should land on the last row when stepping back from nothing', () => focusTarget(CascadeStep.Previous, -1, 4).should.equal(3));
    it('should go to either end', () => [focusTarget(CascadeStep.First, 2, 4), focusTarget(CascadeStep.Last, 2, 4)].should.deep.equal([0, 3]));
    it('should find nowhere to go in an empty panel', () => focusTarget(CascadeStep.Next, -1, 0).should.equal(-1));
});

describe('when reading keys for a cascading menu', () => {
    it('should open a submenu with the right arrow and leave it with the left', () => [stepForKey('ArrowRight', false), stepForKey('ArrowLeft', false)].should.deep.equal([CascadeStep.Into, CascadeStep.Out]));
    it('should leave the caret keys to a text field', () => [stepForKey('ArrowRight', true), stepForKey('ArrowLeft', true), stepForKey('Home', true)].should.deep.equal([undefined, undefined, undefined]));
    it('should still move through rows with the vertical arrows from a text field', () => [stepForKey('ArrowDown', true), stepForKey('ArrowUp', true)].should.deep.equal([CascadeStep.Next, CascadeStep.Previous]));
    it('should ignore other keys', () => (stepForKey('a', false) === undefined).should.be.true);
});
