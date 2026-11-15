// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind } from '@cratis/scene.model';
import { isPeeking, moved } from '../peekOf';

const dashboard = { kind: DestinationKind.Slot, screen: 'Dashboard' };
const customers = { kind: DestinationKind.Slot, screen: 'Customers' };

describe('when the first screen is drawn', () => {
    const state = moved({}, dashboard, false);

    it('should become the chosen screen', () => state.base!.should.equal(dashboard));
    it('should not be a peek', () => isPeeking(state).should.be.false);
});

describe('when the canvas moves on something other than the picker', () => {
    const state = moved(moved({}, dashboard, true), customers, false);

    it('should keep the chosen screen', () => state.base!.should.equal(dashboard));
    it('should be a peek at where it is now', () => isPeeking(state).should.be.true);
});

describe('when the picker chooses a screen while peeking', () => {
    const state = moved(moved(moved({}, dashboard, true), customers, false), customers, true);

    it('should make it the chosen screen', () => state.base!.should.equal(customers));
    it('should no longer be a peek', () => isPeeking(state).should.be.false);
});

describe('when a peek goes back to the chosen screen', () => {
    const state = moved(moved(moved({}, dashboard, true), customers, false), dashboard, true);

    it('should no longer be a peek', () => isPeeking(state).should.be.false);
});
