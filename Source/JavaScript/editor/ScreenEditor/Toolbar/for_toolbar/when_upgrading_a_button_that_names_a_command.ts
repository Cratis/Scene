// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { upgradeEdits, upgradeOf } from '../upgradeToolbarButton';
import { application } from './given_a_toolbar_and_an_application';

describe('when a button names a command exactly one slice accepts', () => {
    it('should resolve to that slice, as Scene does when it resolves the button', () => upgradeOf(application, 'b', { kind: 'Action', target: 'PlaceOrderCommand' })!.should.deep.equal({ slice: 'sales.orders.PlaceOrder' }));
    it('should resolve a command named by the slice itself', () => upgradeOf(application, 'b', { kind: 'Action', target: 'sales.orders.CancelOrder' })!.should.deep.equal({ slice: 'sales.orders.CancelOrder' }));
});

describe('when there is nothing to upgrade', () => {
    it('should leave a button that already names a slice', () => (upgradeOf(application, 'b', { kind: 'Action', slice: 'sales.orders.PlaceOrder', target: 'PlaceOrderCommand' }) === undefined).should.be.true);
    it('should leave a command no slice accepts', () => (upgradeOf(application, 'b', { kind: 'Action', target: 'NoSuchCommand' }) === undefined).should.be.true);
    it('should leave a button with neither', () => (upgradeOf(application, 'b', { kind: 'Action' }) === undefined).should.be.true);
    it('should do nothing without an application', () => (upgradeOf({ modules: [] }, 'b', { kind: 'Action', target: 'PlaceOrderCommand' }) === undefined).should.be.true);
});

describe('when writing the upgrade', () => {
    const edits = upgradeEdits('b', 'sales.orders.PlaceOrder');
    it('should set the slice and clear the command, as two edits of one step', () => { edits.should.have.length(2); edits[0].kind.should.equal('setProperty'); edits[1].kind.should.equal('resetProperty'); });
});
